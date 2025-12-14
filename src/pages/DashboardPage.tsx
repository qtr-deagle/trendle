import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useViewContext } from "@/contexts/ViewContext";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Home from "./Home";
import Explore from "./Explore";
import Communities from "./Communities";
import Inbox from "./Inbox";
import Account from "./Account";
import Settings from "./Settings";

const DashboardPage = () => {
  const location = useLocation();
  const { activeView, setView } = useViewContext();
  const { logout } = useAuth();
  const lastRouteRef = useRef(location.pathname);

  // Sync the active view with the current route
  // Only update if the route actually changed (not when just clicking buttons)
  useEffect(() => {
    const pathToView = (pathname: string) => {
      if (pathname.includes("/explore")) return "explore";
      if (pathname.includes("/communities")) return "communities";
      if (pathname.includes("/inbox")) return "inbox";
      if (pathname.includes("/account")) return "account";
      if (pathname.includes("/settings")) return "settings";
      return "home";
    };

    // Only sync if the route changed (not from button clicks which don't change route)
    if (location.pathname !== lastRouteRef.current) {
      lastRouteRef.current = location.pathname;
      const newView = pathToView(location.pathname);
      setView(newView);
    }
  }, [location.pathname, setView]);

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <Home useViewSwitching={true} />;
      case "explore":
        return <Explore useViewSwitching={true} />;
      case "communities":
        return <Communities useViewSwitching={true} />;
      case "inbox":
        return <Inbox useViewSwitching={true} />;
      case "account":
        return <Account useViewSwitching={true} />;
      case "settings":
        return <Settings useViewSwitching={true} />;
      default:
        return <Home useViewSwitching={true} />;
    }
  };

  return (
    <MainLayout onLogout={logout} useViewSwitching={true}>
      {renderContent()}
    </MainLayout>
  );
};

export default DashboardPage;
