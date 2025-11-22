/**
 * useToggle Hook
 * 
 * Binary toggle state for modals, dropdowns, accordions, sidebars.
 * Simple but powerful hook for boolean state management.
 * 
 * @example
 * ```tsx
 * function Sidebar() {
 *   const [isOpen, toggle, open, close] = useToggle(false);
 * 
 *   return (
 *     <>
 *       <button onClick={toggle}>Toggle Sidebar</button>
 *       <AnimatePresence>
 *         {isOpen && (
 *           <motion.aside
 *             initial={{ x: -300 }}
 *             animate={{ x: 0 }}
 *             exit={{ x: -300 }}
 *           >
 *             <button onClick={close}>Close</button>
 *             Sidebar Content
 *           </motion.aside>
 *         )}
 *       </AnimatePresence>
 *     </>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function Modal() {
 *   const [showModal, toggleModal, openModal, closeModal] = useToggle();
 * 
 *   return (
 *     <>
 *       <button onClick={openModal}>Open Modal</button>
 *       {showModal && (
 *         <div className="modal">
 *           <h2>Modal Title</h2>
 *           <button onClick={closeModal}>Close</button>
 *         </div>
 *       )}
 *     </>
 *   );
 * }
 * ```
 */

import { useState, useCallback } from 'react';

type UseToggleReturn = [
  boolean,
  () => void,
  () => void,
  () => void
];

export function useToggle(initialState: boolean = false): UseToggleReturn {
  const [state, setState] = useState(initialState);

  // Toggle between true and false
  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  // Set to true
  const setTrue = useCallback(() => {
    setState(true);
  }, []);

  // Set to false
  const setFalse = useCallback(() => {
    setState(false);
  }, []);

  return [state, toggle, setTrue, setFalse];
}

/**
 * useMultiToggle Hook
 * 
 * Manage multiple toggle states with a single hook.
 * Useful for accordion panels, tabs, or multiple modals.
 * 
 * @example
 * ```tsx
 * function Accordion() {
 *   const { isOpen, toggle, open, close, toggleMultiple } = useMultiToggle({
 *     panel1: false,
 *     panel2: false,
 *     panel3: false,
 *   });
 * 
 *   return (
 *     <div>
 *       <button onClick={() => toggle('panel1')}>
 *         Panel 1 {isOpen('panel1') ? '▲' : '▼'}
 *       </button>
 *       {isOpen('panel1') && <div>Panel 1 Content</div>}
 *       
 *       <button onClick={() => toggle('panel2')}>
 *         Panel 2 {isOpen('panel2') ? '▲' : '▼'}
 *       </button>
 *       {isOpen('panel2') && <div>Panel 2 Content</div>}
 *     </div>
 *   );
 * }
 * ```
 */

interface UseMultiToggleReturn<K extends string> {
  states: Record<K, boolean>;
  isOpen: (key: K) => boolean;
  toggle: (key: K) => void;
  open: (key: K) => void;
  close: (key: K) => void;
  openMultiple: (keys: K[]) => void;
  closeMultiple: (keys: K[]) => void;
  openAll: () => void;
  closeAll: () => void;
  setStates: (newStates: Partial<Record<K, boolean>>) => void;
}

export function useMultiToggle<K extends string>(
  initialStates: Record<K, boolean>
): UseMultiToggleReturn<K> {
  const [states, setStates] = useState<Record<K, boolean>>(initialStates);

  const isOpen = useCallback((key: K): boolean => {
    return states[key];
  }, [states]);

  const toggle = useCallback((key: K) => {
    setStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const open = useCallback((key: K) => {
    setStates((prev) => ({
      ...prev,
      [key]: true,
    }));
  }, []);

  const close = useCallback((key: K) => {
    setStates((prev) => ({
      ...prev,
      [key]: false,
    }));
  }, []);

  const openMultiple = useCallback((keys: K[]) => {
    setStates((prev) => {
      const newStates = { ...prev };
      keys.forEach((key) => {
        newStates[key] = true;
      });
      return newStates;
    });
  }, []);

  const closeMultiple = useCallback((keys: K[]) => {
    setStates((prev) => {
      const newStates = { ...prev };
      keys.forEach((key) => {
        newStates[key] = false;
      });
      return newStates;
    });
  }, []);

  const openAll = useCallback(() => {
    setStates((prev) => {
      const newStates = { ...prev };
      Object.keys(newStates).forEach((key) => {
        newStates[key as K] = true;
      });
      return newStates;
    });
  }, []);

  const closeAll = useCallback(() => {
    setStates((prev) => {
      const newStates = { ...prev };
      Object.keys(newStates).forEach((key) => {
        newStates[key as K] = false;
      });
      return newStates;
    });
  }, []);

  const updateStates = useCallback((newStates: Partial<Record<K, boolean>>) => {
    setStates((prev) => ({
      ...prev,
      ...newStates,
    }));
  }, []);

  return {
    states,
    isOpen,
    toggle,
    open,
    close,
    openMultiple,
    closeMultiple,
    openAll,
    closeAll,
    setStates: updateStates,
  };
}
