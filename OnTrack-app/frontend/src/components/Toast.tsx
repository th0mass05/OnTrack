import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastContextValue = (message: string) => void;

const ToastContext = createContext<ToastContextValue>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage((current) => (current === text ? null : current)), 1800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center pb-safe">
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
