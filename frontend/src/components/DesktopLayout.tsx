import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalProgress } from '../hooks/useLocalProgress';

interface DesktopLayoutProps {
  children: React.ReactNode;
  activeTab?: 'home' | 'conversations' | 'idioms' | 'vocabulary' | 'grammar';
}

export default function DesktopLayout({ children, activeTab }: DesktopLayoutProps) {
  const navigate = useNavigate();
  const { progress } = useLocalProgress();
  const streak = progress.streak;
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return localStorage.getItem('desktop_sidebar_open') !== 'false';
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((open) => {
      const next = !open;
      localStorage.setItem('desktop_sidebar_open', String(next));
      return next;
    });
  };

  return (
    <div className="desktop-theme bg-background text-on-background min-h-screen overflow-x-hidden antialiased">
      {/* TopNavBar */}
      <header className="bg-surface w-full h-16 border-b border-outline-variant/10 fixed top-0 left-0 right-0 z-50 flex justify-between items-center pl-gutter pr-margin-desktop font-body-md text-body-md">
        {/* Left Section: Search & Brand */}
        <div className="flex items-center gap-gutter">
          <button 
            onClick={toggleSidebar}
            className="p-2 mr-1 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-high rounded-full cursor-pointer hidden md:flex items-center justify-center shrink-0"
            aria-label="Toggle Sidebar"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div 
            onClick={() => navigate('/')}
            className="font-title-md text-title-md font-bold text-primary cursor-pointer tracking-tight"
          >
            Bolo English
          </div>
        </div>


        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-stack-sm">
          <div className="hidden sm:flex items-center gap-2 bg-primary-fixed/20 text-primary px-3 py-1.5 rounded-full font-label-sm text-label-sm">
            <span 
              className="material-symbols-outlined text-sm text-secondary" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            Daily Streak: {streak}
          </div>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high cursor-pointer">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <img
            alt="User profile avatar"
            className="w-8 h-8 rounded-full border border-outline-variant/30 object-cover cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all active:scale-95"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCo7KWDIzOqh3D8CeL6J-u80feukcnF61mzyzhC_J4_D5WE8rKQv-_wqFui6zpT9WsK-wV1x4h_KgwBwftH1lRLHg_s-4tJ0tEDk4HtbnfOqJl1fd4WpIrnWRVNA0v2snf0aSDJQckN1qtCmr8WYrB4BycuItW7y3x3I31WeC6I6XDmOPR_pAdrkv8gPQTmEiFwEkLDXjJf-neKpNEA2x0RDULpq1Qbh8QNO-xVlVQLnTKaaKxEwIi8ooPhVP9HuBI_ZnZ5h0kphE8"
            onClick={() => navigate('/progress')}
          />
        </div>
      </header>

      {/* SideNavBar */}
      <aside className={`bg-surface-container-low border-r border-outline-variant/10 fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex flex-col py-stack-md gap-base z-40 overflow-y-auto transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Profile/Header Area */}
        <div className="px-stack-md mb-stack-sm flex flex-col items-center text-center">
          <img 
            alt="Language tutor" 
            className="w-16 h-16 rounded-full mb-3 object-cover shadow-sm border border-outline-variant/20" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC8qgNChylMQQJBei5JxguqPGzCS1KLNbW-D6Fcxebh3ZKGbEcbR8VOBGoE5xC6os4tLBTTD7F8mINMyqvKgKE6WsREmA9sfBodVAjXqoRpPeHcpxUDky4ZL0CP1jFQzypREgLJ-28uJ3vNFusyFcSULWOpmjKpFk06io0xD5DHWTta743vdhaAYT5GY_55mazA1DLfFiYZYBGKpU-1daxm7PCFtzP8v148tesyVDs-B6Gr4ULeBKh0CgPLp9uyrZItMUnyuq4nlM"
          />
          <h3 className="font-title-md text-title-md text-primary font-bold">Learning Path</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Level: Intermediate</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 flex flex-col gap-1 font-title-md text-title-md">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all w-full cursor-pointer ${
              activeTab === 'home'
                ? 'text-primary font-bold bg-primary/5 border-r-4 border-primary scale-95 duration-150'
                : 'text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
            >
              home
            </span>
            <span className="font-title-md text-title-md text-[16px]">Home</span>
          </button>

          <button
            onClick={() => navigate('/conversations')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all w-full cursor-pointer ${
              activeTab === 'conversations'
                ? 'text-primary font-bold bg-primary/5 border-r-4 border-primary scale-95 duration-150'
                : 'text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: activeTab === 'conversations' ? "'FILL' 1" : "'FILL' 0" }}
            >
              record_voice_over
            </span>
            <span className="font-title-md text-title-md text-[16px]">Talk</span>
          </button>

          <button
            onClick={() => navigate('/idioms')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all w-full cursor-pointer ${
              activeTab === 'idioms'
                ? 'text-primary font-bold bg-primary/5 border-r-4 border-primary scale-95 duration-150'
                : 'text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: activeTab === 'idioms' ? "'FILL' 1" : "'FILL' 0" }}
            >
              auto_stories
            </span>
            <span className="font-title-md text-title-md text-[16px]">Idioms</span>
          </button>

          <button
            onClick={() => navigate('/vocabulary')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all w-full cursor-pointer ${
              activeTab === 'vocabulary'
                ? 'text-primary font-bold bg-primary/5 border-r-4 border-primary scale-95 duration-150'
                : 'text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: activeTab === 'vocabulary' ? "'FILL' 1" : "'FILL' 0" }}
            >
              menu_book
            </span>
            <span className="font-title-md text-title-md text-[16px]">Words</span>
          </button>

          <button
            onClick={() => navigate('/grammar')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all w-full cursor-pointer ${
              activeTab === 'grammar'
                ? 'text-primary font-bold bg-primary/5 border-r-4 border-primary scale-95 duration-150'
                : 'text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: activeTab === 'grammar' ? "'FILL' 1" : "'FILL' 0" }}
            >
              architecture
            </span>
            <span className="font-title-md text-title-md text-[16px]">Grammar</span>
          </button>
        </nav>

        {/* CTA */}
        <div className="px-4 mt-auto">
          <button 
            onClick={() => navigate('/conversations')}
            className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-label-sm text-label-sm uppercase tracking-wide hover:bg-secondary-container transition-colors shadow-sm cursor-pointer font-bold"
          >
            Start Practice
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`pt-16 min-h-screen transition-all duration-300 ${
        isSidebarOpen ? 'md:pl-64' : 'md:pl-0'
      }`}>
        {children}
      </main>
    </div>
  );
}
