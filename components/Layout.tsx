
import React from 'react';
import { User } from '../types';
import { LogOut, Home, GraduationCap } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  onHome: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, onHome, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={onHome} className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <GraduationCap size={28} />
            <span className="hidden sm:inline">EduPro Manager</span>
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90 hidden sm:block">{user.email}</span>
            <button 
              onClick={onHome}
              className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
              title="Dashboard"
            >
              <Home size={20} />
            </button>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-slate-100 border-t py-4 text-center text-slate-500 text-xs">
        &copy; {new Date().getFullYear()} EduPro Manager - Gestión Escolar Profesional
      </footer>
    </div>
  );
};
