import { createContext, useContext, useState, ReactNode } from "react";

export type ViewType = "home" | "explore" | "communities" | "inbox" | "account" | "settings";

interface ViewContextType {
  activeView: ViewType;
  setView: (view: ViewType) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider = ({ children }: { children: ReactNode }) => {
  const [activeView, setView] = useState<ViewType>("home");

  return (
    <ViewContext.Provider value={{ activeView, setView }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useViewContext must be used within ViewProvider");
  }
  return context;
};
