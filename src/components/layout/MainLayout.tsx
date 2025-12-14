import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";

interface MainLayoutProps {
  children: ReactNode;
  onLogout?: () => void;
  hideRightSidebar?: boolean;
  useViewSwitching?: boolean;
}

const MainLayout = ({ children, onLogout, hideRightSidebar, useViewSwitching = false }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} useViewSwitching={useViewSwitching} />
      <main className={`ml-64 min-h-screen ${hideRightSidebar ? '' : 'mr-80'}`}>
        {children}
      </main>
      {!hideRightSidebar && <RightSidebar />}
    </div>
  );
};

export default MainLayout;
