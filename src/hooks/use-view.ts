import { useState, useCallback } from "react";

export type ViewType = "home" | "explore" | "communities" | "inbox" | "account" | "settings";

interface UseViewReturn {
  activeView: ViewType;
  setView: (view: ViewType) => void;
}

const useView = (initialView: ViewType = "home"): UseViewReturn => {
  const [activeView, setActiveView] = useState<ViewType>(initialView);

  const setView = useCallback((view: ViewType) => {
    setActiveView(view);
  }, []);

  return { activeView, setView };
};

export default useView;
