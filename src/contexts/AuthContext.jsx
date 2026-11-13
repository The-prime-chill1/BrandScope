import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth';
import { dataStore } from '../services/dataStore';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeVersion, setStoreVersion] = useState(0);
  const { addToast } = useToast();

  const syncBrand = useCallback((activeUser) => {
    setCurrentBrand(activeUser ? dataStore.getBrandByOwnerUid(activeUser.uid) : null);
  }, []);

  const applyAuthenticatedUser = useCallback(async (activeUser) => {
    if (!activeUser) {
      setUser(null);
      setCurrentBrand(null);
      await dataStore.refreshPrivateData(null);
      return null;
    }

    await dataStore.refreshAll(activeUser);
    setUser(activeUser);
    syncBrand(activeUser);
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
      const newUser = await authService.register(payload);
      if (!newUser.requiresEmailConfirmation) {
        await applyAuthenticatedUser(newUser);
        addToast('Your brand profile is now live.', 'success');
      } else {
        addToast('Check your email to confirm your account and publish your brand.', 'success');
      }
      return newUser;
    } catch (error) {
      addToast(error.message || 'Registration failed.', 'error');
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    await applyAuthenticatedUser(null);
    addToast('Signed out successfully.', 'info');
  };

  const refreshBrand = async () => {
    if (!user) return null;
    await dataStore.refreshAll(user);
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
