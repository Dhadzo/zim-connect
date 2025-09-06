import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarNavigation from './SidebarNavigation';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const ResponsiveLayout = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reset scroll position when route changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <Header />
      
      {/* LinkedIn-style Layout: Centered content with balanced sidebars */}
      <div className="h-full pt-14 sm:pt-16">
        <div className="max-w-6xl mx-auto h-full flex gap-8">
          {/* Left Sidebar - Always visible on desktop */}
          <div className="hidden lg:block lg:w-56 flex-shrink-0">
            <div className="h-full overflow-y-auto">
              <SidebarNavigation />
            </div>
          </div>

          {/* Main Content Area - Centered and responsive */}
          <div className="flex-1 h-full overflow-y-auto" ref={containerRef}>
            <div className="pb-16 lg:pb-0 py-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ResponsiveLayout;
