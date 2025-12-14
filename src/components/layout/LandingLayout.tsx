import { ReactNode } from "react";
import LandingSidebar from "./LandingSidebar";
import RightSidebar from "./RightSidebar";

interface LandingLayoutProps {
  children: ReactNode;
  hideRightSidebar?: boolean;
}

const LandingLayout = ({ children, hideRightSidebar }: LandingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <LandingSidebar />
      <main className={`ml-64 min-h-screen ${hideRightSidebar ? '' : 'mr-80'}`}>
        {children}
      </main>
      {!hideRightSidebar && <RightSidebar />}
    </div>
  );
};

export default LandingLayout;
