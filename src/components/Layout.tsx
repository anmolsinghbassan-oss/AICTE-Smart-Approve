import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { FloatingAIAssistant } from './FloatingAIAssistant';
import { DeadlineToast } from './DeadlineToast';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Fixed Top Bar */}
      <TopBar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <LeftSidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Pane */}
        <main className="flex-1 transition-all duration-300 lg:pl-64 flex flex-col min-w-0">
          <div className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            <Outlet />
          </div>

          {/* Statutory Footer */}
          <footer className="py-4 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 mt-auto">
            <p>
              Integrated AICTE Approval Workflow Automation & Compliance Monitoring Portal
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              All India Council for Technical Education (AICTE), Ministry of Education, Government of India
            </p>
          </footer>
        </main>
      </div>

      {/* Floating Elements */}
      <FloatingAIAssistant />
      <DeadlineToast />
    </div>
  );
};
