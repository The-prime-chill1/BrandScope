import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';

const normalizeOptions = (options) => options.map((option) => (
  typeof option === 'string'
    ? { value: option, label: option }
    : option
));

export const SelectField = ({
  id,
  value,
  options = [],
  onChange,
  placeholder = 'Select an option',
  ariaLabel,
  className = '',
  disabled = false,
}) => {
  const generatedId = useId();
  const controlId = id || `select-${generatedId.replace(/:/g, '')}`;
  const menuId = `${controlId}-menu`;
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const optionRefs = useRef([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [opensUpward, setOpensUpward] = useState(false);
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);
  const selectedIndex = normalizedOptions.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? normalizedOptions[selectedIndex] : null;
  const usesMobileSheet = typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches;

  useEffect(() => {
    if (!open) return undefined;

    const closeIfOutside = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false);
    };

    const closeOnViewportChange = (event) => {
      if (event?.type === 'scroll' && (rootRef.current?.contains(event.target) || menuRef.current?.contains(event.target))) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', closeIfOutside);
    window.addEventListener('resize', closeOnViewportChange);
    window.addEventListener('scroll', closeOnViewportChange, true);

    return () => {
      document.removeEventListener('pointerdown', closeIfOutside);
      window.removeEventListener('resize', closeOnViewportChange);
      window.removeEventListener('scroll', closeOnViewportChange, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 720px)').matches) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;
    setActiveIndex(nextIndex);
    requestAnimationFrame(() => optionRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest' }));
  }, [open, selectedIndex]);

  const openMenu = () => {
    if (disabled) return;
    const rect = rootRef.current?.getBoundingClientRect();
    const estimatedMenuHeight = Math.min(292, normalizedOptions.length * 46 + 16);
    if (rect) {
      const roomBelow = window.innerHeight - rect.bottom;
      const roomAbove = rect.top;
      setOpensUpward(roomBelow < estimatedMenuHeight && roomAbove > roomBelow);
    }
    setOpen(true);
  };

  const chooseOption = (option) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setOpen(false);
    requestAnimationFrame(() => rootRef.current?.querySelector('.select-trigger')?.focus());
  };

  const moveActive = (direction) => {
    if (!normalizedOptions.length) return;
    let nextIndex = activeIndex;
    do {
      nextIndex = (nextIndex + direction + normalizedOptions.length) % normalizedOptions.length;
    } while (normalizedOptions[nextIndex]?.disabled && nextIndex !== activeIndex);
    setActiveIndex(nextIndex);
    requestAnimationFrame(() => optionRefs.current[nextIndex]?.scrollIntoView({ block: 'nearest' }));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openMenu();
      else moveActive(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(Math.max(0, normalizedOptions.length - 1));
      return;
    }

    if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      if (normalizedOptions[activeIndex]) chooseOption(normalizedOptions[activeIndex]);
      return;
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const menu = open ? (
    <>
      <button type="button" className="select-mobile-backdrop" aria-label="Close options" onClick={() => setOpen(false)} />
      <div ref={menuRef} className={`select-menu ${usesMobileSheet ? 'select-menu--sheet' : ''}`}>
        <div className="select-menu-header">
          <span><small>Choose an option</small><strong>{ariaLabel || placeholder}</strong></span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close options"><X size={18} /></button>
        </div>
        <div id={menuId} className="select-options" role="listbox" aria-label={ariaLabel}>
          {normalizedOptions.map((option, index) => {
            const selected = option.value === value;
            return (
              <button
                id={`${controlId}-option-${index}`}
                key={`${option.value}-${index}`}
                ref={(node) => { optionRefs.current[index] = node; }}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={option.disabled}
                className={`select-option ${selected ? 'is-selected' : ''} ${activeIndex === index ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => chooseOption(option)}
              >
                <span>{option.label}</span>
                {selected && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={`select-control ${open ? 'is-open' : ''} ${opensUpward ? 'opens-upward' : ''} ${className}`.trim()}
    >
      <button
        id={controlId}
        type="button"
        className="select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-activedescendant={open ? `${controlId}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span className={selectedOption ? '' : 'is-placeholder'}>{selectedOption?.label || placeholder}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>

      {open && !usesMobileSheet && menu}
      {open && usesMobileSheet && createPortal(menu, document.body)}
    </div>
  );
};

export default SelectField;
