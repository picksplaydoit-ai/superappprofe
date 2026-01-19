import React, { useState } from 'react';
import { Home, GraduationCap, Pencil, Check } from 'lucide-react';

interface LayoutProps {
  onHome: () => void;
  children: React.ReactNode;
  professorName: string;
  onProfessorNameChange: (name: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ onHome, children, professorName, onProfessorNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(professorName);

  const handleSaveName = () => {
    onProfessorNameChange(tempName);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header>
        <div className="header-container">
          <div className="flex flex-col">
            <button onClick={onHome} className="flex items-center gap-2 font-black text-white text-xl tracking-tight active-scale bg-transparent border-none p-0">
              <GraduationCap size={28} />
              <span>EduPro Manager</span>
            </button>
            
            <div className="flex items-center gap-2 mt-0.5 ml-8">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input 
                    autoFocus
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button onClick={handleSaveName} className="text-white hover:text-indigo-200">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setTempName(professorName);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 text-indigo-100 hover:text-white transition-all active-scale p-0 bg-transparent border-none"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[180px]">
                    {professorName ? `Prof. ${professorName}` : 'Configurar Profesor'}
                  </span>
                  <Pencil size={10} className="opacity-50" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={onHome}
              className="p-3.5 bg-indigo-500/30 hover:bg-indigo-700 rounded-2xl transition-all active-scale text-white"
              title="Inicio"
            >
              <Home size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-slate-100 border-t py-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
        &copy; {new Date().getFullYear()} EduPro Manager - Gestión Local Profesional
      </footer>
    </div>
  );
};