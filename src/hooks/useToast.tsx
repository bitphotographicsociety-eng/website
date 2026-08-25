/* ==========================================================================
   Toast context — replaces the imperative psocToast() with a React hook
   ========================================================================== */

import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";

interface ToastContextValue {
  message: string;
  visible: boolean;
  toast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  message: "",
  visible: false,
  toast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ message, visible, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
