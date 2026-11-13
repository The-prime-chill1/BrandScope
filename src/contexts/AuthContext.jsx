import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authService } from '../services/auth';
import { dataStore } from '../services/dataStore';
import { useToast } from './ToastContext';
import { showDeviceNotification } from '../services/deviceNotifications';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brandLoading, setBrandLoading] = useState(false);
  const [storeVersion, setStoreVersion] = useState(0);
  const activeUserRef = useRef(null);
  const { addToast } = useToast();

  const syncBrand = useCallback((activeUser) => {
    setCurrentBrand(activeUser ? dataStore.getBrandByOwnerUid(activeUser.uid) : null);
  }, []);

  const applyAuthenticatedUser = useCallback(async (activeUser) => {
    const previousUser = activeUserRef.current;
    activeUserRef.current = activeUser;
    if (!activeUser) {
      setUser(null);
      setCurrentBrand(null);
      setBrandLoading(false);
      void dataStore.refreshPrivateData(null);
      return null;
    }

    setUser(activeUser);
    const cachedBrand = dataStore.getBrandByOwnerUid(activeUser.uid);
    setCurrentBrand(cachedBrand);
    setBrandLoading(!cachedBrand);
    if (previousUser?.uid === activeUser.uid && previousUser.role === activeUser.role) return activeUser;

    // The route can render as soon as the local session is known. The small
    // owned-brand query and private account queues hydrate concurrently.
    void Promise.allSettled([
      dataStore.refreshOwnedBrand(activeUser.uid),
      dataStore.refreshPrivateData(activeUser)
    ]).then((results) => {
      if (activeUserRef.current?.uid !== activeUser.uid) return;
      syncBrand(activeUser);
      setBrandLoading(false);
      results.forEach((result) => {
        if (result.status === 'rejected') {
          console.warn('[BRANDSCOPE] Account data could not refresh:', result.reason);
        }
      });
    });
    return activeUser;
  }, [syncBrand]);

  useEffect(() => {
    let mounted = true;

    const unsubscribeStore = dataStore.subscribe(() => {
      if (!mounted) return;
      setStoreVersion((version) => version + 1);
      setUser((activeUser) => {
        syncBrand(activeUser);
        return activeUser;
      });
    });

    const initializeAuth = async () => {
      try {
        const activeUser = await authService.getCurrentUser();
        if (!mounted) return;
        if (activeUser) await applyAuthenticatedUser(activeUser);
      } catch (error) {
        if (mounted) console.warn('[BRANDSCOPE] Could not restore the current session:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const unsubscribeAuth = authService.onAuthStateChange((event, authUser) => {
      window.setTimeout(async () => {
        if (!mounted) return;
        try {
          if (event === 'SIGNED_OUT' || !authUser) {
            await applyAuthenticatedUser(null);
            return;
          }

          if (activeUserRef.current?.uid === authUser.id && ['SIGNED_IN', 'TOKEN_REFRESHED', 'INITIAL_SESSION'].includes(event)) {
            return;
          }

          const normalized = await authService.normalizeUser(authUser);
          await applyAuthenticatedUser(normalized);

          const authFlow = sessionStorage.getItem('brandscope_auth_flow');
          if (authFlow === 'invite' || event === 'PASSWORD_RECOVERY') {
            sessionStorage.removeItem('brandscope_auth_flow');
            if (window.location.pathname !== '/set-password') window.location.replace('/set-password');
          }
        } catch (error) {
          console.warn('[BRANDSCOPE] Authentication state sync failed:', error);
        }
      }, 0);
    });

    return () => {
      mounted = false;
      unsubscribeStore();
      unsubscribeAuth();
    };
  }, [applyAuthenticatedUser, syncBrand]);

  useEffect(() => {
    if (!user) return undefined;
    return dataStore.subscribeToNotifications(user, (notification) => {
      addToast(notification.message, 'info', 6000);
      void showDeviceNotification(notification).catch((error) => {
        console.warn('[BRANDSCOPE] Device notification could not be displayed:', error);
      });
    });
  }, [user, addToast]);

  const login = async (email, password, remember = true) => {
    try {
      const loggedIn = await authService.login(email, password, remember);
      await applyAuthenticatedUser(loggedIn);
      addToast(`Welcome back, ${loggedIn.name || loggedIn.email}.`, 'success');
      return loggedIn;
    } catch (error) {
      addToast(error.message || 'Login failed.', 'error');
      throw error;
    }
  };

  const signup = async (payload) => {
    try {
      const registration = await authService.register(payload);
      const { onboardingTask, requiresEmailConfirmation, ...newUser } = registration;
      if (!requiresEmailConfirmation) {
        await applyAuthenticatedUser(newUser);
        addToast('Your brand profile is now live.', 'success');
        if (onboardingTask) {
          void onboardingTask
            .then(() => {
              syncBrand(newUser);
              addToast('Your brand photos finished uploading.', 'success');
            })
            .catch((error) => {
              console.warn('[BRANDSCOPE] Brand media upload did not finish:', error);
              addToast('Your account is ready, but some photos could not upload. You can add them from Brand Profile.', 'error');
            });
        }
      } else {
        addToast('Check your email to confirm your account and publish your brand.', 'success');
      }
      return { ...newUser, requiresEmailConfirmation };
    } catch (error) {
      addToast(error.message || 'Registration failed.', 'error');
      throw error;
    }
  };

  const logout = async () => {
    await applyAuthenticatedUser(null);
    try {
      await authService.logout();
      addToast('Signed out successfully.', 'info');
    } catch (error) {
      addToast(error.message || 'The local session was cleared, but remote sign-out could not be confirmed.', 'error');
    }
  };

  const refreshBrand = async () => {
    if (!user) return null;
    const brand = dataStore.getBrandByOwnerUid(user.uid);
    setCurrentBrand(brand);
    return brand;
  };

  const unreadNotifCount = useMemo(
    () => (user ? dataStore.getNotifications(user.uid).filter((notification) => !notification.read).length : 0),
    [user, storeVersion]
  );

  return (
    <AuthContext.Provider value={{
      user,
      currentBrand,
      isAdmin: user?.role === 'admin',
      isBrandOwner: user?.role === 'brand_owner',
      loading,
      brandLoading,
      login,
      signup,
      logout,
      refreshBrand,
      unreadNotifCount,
      supabaseConfigured: authService.isConfigured,
      connectionError: dataStore.connectionError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
