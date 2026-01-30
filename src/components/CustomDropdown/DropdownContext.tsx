import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type DropdownContextValue = {
  openId: string | null;
  registerOpen: (id: string) => void;
  close: () => void;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function DropdownProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const registerOpen = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? prev : id));
  }, []);

  const close = useCallback(() => setOpenId(null), []);

  return (
    <DropdownContext.Provider value={{ openId, registerOpen, close }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  return ctx;
}
