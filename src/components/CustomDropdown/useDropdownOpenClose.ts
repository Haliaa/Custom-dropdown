import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type MutableRefObject,
} from 'react';
import { useDropdownContext } from './DropdownContext';

type UseDropdownOpenCloseOptions = {
  id: string;
  disabled?: boolean;
  /** Called after open; use a ref so caller can inject latest logic (e.g. reset search, focus input). */
  onOpenRef?: MutableRefObject<(() => void) | undefined>;
  onClose?: () => void;
};

/**
 * Single responsibility: open/close state and trigger/blur/keyboard behavior.
 * Reusable for any dropdown-like UI (select, combobox, custom list).
 */
export function useDropdownOpenClose({
  id,
  disabled = false,
  onOpenRef,
  onClose,
}: UseDropdownOpenCloseOptions) {
  const ctx = useDropdownContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justOpenedRef = useRef(false);

  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = ctx ? ctx.openId === id : localOpen;

  const open = useCallback(() => {
    if (disabled) return;
    ctx?.registerOpen(id);
    setLocalOpen(true);
    onOpenRef?.current?.();
  }, [disabled, ctx, id]);

  const close = useCallback(() => {
    justOpenedRef.current = false;
    ctx?.close();
    setLocalOpen(false);
    onClose?.();
  }, [ctx, onClose]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const handleTriggerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      if (!isOpen) justOpenedRef.current = true;
      open();
    },
    [disabled, isOpen, open]
  );

  const handleTriggerClick = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (isOpen && justOpenedRef.current) {
      justOpenedRef.current = false;
      return;
    }
    toggle();
  }, [toggle, isOpen]);

  const handleTriggerFocus = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    open();
  }, [open]);

  const handleBlur = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current && !containerRef.current.contains(active)) {
        close();
      }
      closeTimeoutRef.current = null;
    }, 0);
  }, [close]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        close();
        (e.target as HTMLElement).blur();
      }
    },
    [close]
  );

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return {
    containerRef,
    isOpen,
    open,
    close,
    toggle,
    handleTriggerMouseDown,
    handleTriggerClick,
    handleTriggerFocus,
    handleBlur,
    handleKeyDown,
  };
}
