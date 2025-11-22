/**
 * useClickOutside Hook
 * 
 * Detect clicks outside a ref element to close dropdowns, modals, menus.
 * Automatically handles escape key press as well.
 * 
 * @example
 * ```tsx
 * function Dropdown() {
 *   const [isOpen, , open, close] = useToggle(false);
 *   const dropdownRef = useRef<HTMLDivElement>(null);
 * 
 *   useClickOutside(dropdownRef, close);
 * 
 *   return (
 *     <div>
 *       <button onClick={open}>Open Menu</button>
 *       {isOpen && (
 *         <div ref={dropdownRef} className="dropdown-menu">
 *           <button>Option 1</button>
 *           <button>Option 2</button>
 *           <button>Option 3</button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function Modal() {
 *   const [showModal, , , closeModal] = useToggle(false);
 *   const modalRef = useRef<HTMLDivElement>(null);
 * 
 *   useClickOutside(modalRef, closeModal, showModal);
 * 
 *   return showModal ? (
 *     <div className="modal-overlay">
 *       <motion.div
 *         ref={modalRef}
 *         initial={{ opacity: 0, scale: 0.9 }}
 *         animate={{ opacity: 1, scale: 1 }}
 *         className="modal-content"
 *       >
 *         Modal Content
 *       </motion.div>
 *     </div>
 *   ) : null;
 * }
 * ```
 */

import { useEffect, type RefObject } from 'react';

interface UseClickOutsideOptions {
  enabled?: boolean;
  listenEscape?: boolean;
  mouseEvent?: 'mousedown' | 'mouseup';
}

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent | KeyboardEvent) => void,
  options: UseClickOutsideOptions = {}
): void {
  const {
    enabled = true,
    listenEscape = true,
    mouseEvent = 'mousedown',
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      handler(event);
    };

    const escapeListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler(event);
      }
    };

    // Add event listeners
    document.addEventListener(mouseEvent, listener);
    document.addEventListener('touchstart', listener);

    if (listenEscape) {
      document.addEventListener('keydown', escapeListener);
    }

    // Clean up
    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener('touchstart', listener);
      
      if (listenEscape) {
        document.removeEventListener('keydown', escapeListener);
      }
    };
  }, [ref, handler, enabled, listenEscape, mouseEvent]);
}

/**
 * useClickInside Hook
 * 
 * Detect clicks inside a ref element.
 * Useful for analytics, tracking interactions, or conditional logic.
 * 
 * @example
 * ```tsx
 * function TrackableCard() {
 *   const cardRef = useRef<HTMLDivElement>(null);
 * 
 *   useClickInside(cardRef, () => {
 *     console.log('Card clicked - track analytics');
 *     trackEvent('card_clicked', { cardId: 'workout-plan-123' });
 *   });
 * 
 *   return <div ref={cardRef}>Card Content</div>;
 * }
 * ```
 */

export function useClickInside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Only trigger if clicking inside ref's element
      if (ref.current && ref.current.contains(target)) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

/**
 * useFocusTrap Hook
 * 
 * Trap focus within a modal or dialog for accessibility.
 * Prevents tabbing outside the modal.
 * 
 * @example
 * ```tsx
 * function AccessibleModal() {
 *   const [isOpen, , , close] = useToggle(false);
 *   const modalRef = useRef<HTMLDivElement>(null);
 * 
 *   useFocusTrap(modalRef, isOpen);
 * 
 *   return isOpen ? (
 *     <div className="modal-overlay">
 *       <div ref={modalRef} role="dialog" aria-modal="true">
 *         <h2>Modal Title</h2>
 *         <button>Action 1</button>
 *         <button>Action 2</button>
 *         <button onClick={close}>Close</button>
 *       </div>
 *     </div>
 *   ) : null;
 * }
 * ```
 */

export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstElement?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [ref, enabled]);
}
