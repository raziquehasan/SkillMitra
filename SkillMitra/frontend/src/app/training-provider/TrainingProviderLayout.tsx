"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TrainingProviderHeader } from "@/app/training-provider/TrainingProviderHeader";
import { TrainingProviderSidebar } from "@/app/training-provider/TrainingProviderSidebar";
import { useAuth } from "@/contexts/AuthContext";

interface TrainingProviderLayoutProps {
  children: React.ReactNode;
}

export function TrainingProviderLayout({ children }: TrainingProviderLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('dashboard');
  const { logout } = useAuth();

  // Map routes to sections
  const getActiveSection = (path: string) => {
    const pathSection = path.split('/')[2] || 'dashboard';
    const sectionMapping: Record<string, string> = {
      'courses': 'training',
      'curriculum-alignment': 'training',
      'training-capacity': 'training',
      'training-schedule': 'training',
      'industry-demand': 'intelligence',
      'skill-gaps': 'intelligence',
      'district-demand': 'intelligence',
      'trainers': 'operations',
      'equipment': 'operations',
      'enrollments': 'operations',
      'assessments': 'operations',
      'reports': 'reports',
      'institute-profile': 'institute',
      'certifications': 'institute',
      'notifications': 'account',
      'support': 'account',
      'profile': 'account',
      'settings': 'account',
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
      <TrainingProviderHeader 
        sidebarOpen={sidebarOpen} 
        onToggleSidebar={handleToggleSidebar}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={handleToggleNotifications}
        profileOpen={profileOpen}
        onToggleProfile={handleToggleProfile}
        onLogout={logout}
      />
      
      <div className="flex">
        <TrainingProviderSidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          onLogout={logout}
        />
        
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          } pt-4 pb-8`}
        >
          <div className="max-w-7xl mx-auto px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}