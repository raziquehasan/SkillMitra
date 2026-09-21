"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { GovernmentHeader } from "@/app/government/GovernmentHeader";
import { GovernmentSidebar } from "@/app/government/GovernmentSidebar";
import { NotificationPanel } from "@/app/government/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";

interface GovernmentLayoutProps {
  children: React.ReactNode;
}

export function GovernmentLayout({ children }: GovernmentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  // Detect desktop screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Map removed District Intelligence routes to appropriate sections
  const getActiveSection = (path: string) => {
    const pathSection = path.split('/')[2] || 'dashboard';
    const sectionMapping: Record<string, string> = {
      'districts': 'overview',
      'skill-demand': 'reports',
      'industry-demand': 'industry',
      'skill-gaps': 'reports',
      'emerging-jobs': 'industry',
      'training-plan': 'planning',
    };
    return sectionMapping[pathSection] || pathSection;
  };

  const handleToggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleToggleNotifications = () => setNotificationsOpen(!notificationsOpen);
  const handleToggleProfile = () => setProfileOpen(!profileOpen);

  // Update active section when pathname changes
  useEffect(() => {
    const section = getActiveSection(pathname);
    setActiveSection(section);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <GovernmentHeader 
        sidebarOpen={sidebarOpen} 
        onToggleSidebar={handleToggleSidebar}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={handleToggleNotifications}
        profileOpen={profileOpen}
        onToggleProfile={handleToggleProfile}
        onLogout={logout}
      />
      
      <div className="flex">
        <GovernmentSidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          onLogout={logout}
          isDesktop={isDesktop}
        />
        
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isDesktop ? "ml-64" : "ml-0"
          } pt-4 pb-8`}
        >
          <div className="mx-auto px-4 lg:px-4 xl:px-6">
            {children}
          </div>
        </main>
      </div>
      
      <NotificationPanel 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
}