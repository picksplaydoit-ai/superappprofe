
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
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <button onClick={onHome} className="flex items-center gap-2 font-black text-xl tracking-tight active:scale-95 transition-transform text-left">
              <GraduationCap size={24} />
              <span className="text-base sm:text-lg">EduPro Manager</span>
            </button>
            
            {/* Sección del Nombre del Profesor */}
            <div className="flex items-center gap-2 mt-0.5 ml-8">
              {isEditing ? (
                <div className="flex items-center gap-1 bg-indigo-700 rounded-lg px-2 py-1">
                  <input 
                    autoFocus
                    type="text"
                    className="bg-transparent border-none outline-none text-[10px] font-bold text-white w-32 placeholder:text-indigo-300"
                    placeholder="Tu nombre..."
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button onClick={handleSaveName} className="text-white hover:text-green-300 transition-colors">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setTempName(professorName);
                    setIsEditing(true);
                  }}
                  className="group flex items-center gap-1.5 text-indigo-100 hover:text-white transition-all active:scale-95"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">
                    {professorName ? `Prof. ${professorName}` : 'Configurar Profesor'}
                  </span>
                  <Pencil size={10} className="opacity-40 group-hover:opacity-100" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onHome}
              className="p-3 bg-indigo-500/30 hover:bg-indigo-700 rounded-2xl transition-all active:scale-90"
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
