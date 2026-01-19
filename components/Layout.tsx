import React, { useState } from 'react';
import { Home, GraduationCap, Pencil, Check, Shield } from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface LayoutProps {
  onHome: () => void;
  children: React.ReactNode;
  professorName: string;
  onProfessorNameChange: (name: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ onHome, children, professorName, onProfessorNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(professorName);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleSaveName = () => {
    onProfessorNameChange(tempName);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-[#4f46e5] h-[120px] flex items-center shadow-lg sticky top-0 z-50 px-6 pt-[var(--safe-top)]">
        <div className="max-w-6xl w-full mx-auto flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <button onClick={onHome} className="flex items-center gap-3 font-black text-white text-2xl tracking-tighter bg-transparent border-none p-0 active:scale-95 transition-transform">
              <GraduationCap size={32} />
              <span>EduPro</span>
            </button>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  <input 
                    autoFocus
                    type="text"
                    className="bg-transparent border-none outline-none text-white text-[12px] font-bold w-32 placeholder:text-white/50"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button onClick={handleSaveName} className="text-white"><Check size={16} /></button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-white/80 hover:text-white bg-transparent border-none p-0"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {professorName ? `Prof. ${professorName}` : 'Configurar Profesor'}
                  </span>
                  <Pencil size={12} className="opacity-50" />
                </button>
              )}
            </div>
          </div>
          
          <button 
            onClick={onHome}
            className="p-4 bg-white/10 rounded-[1.5rem] text-white border border-white/10 active:scale-90 transition-transform"
          >
            <Home size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="bg-white border-t py-12 px-6 flex flex-col items-center gap-6">
        <button 
          onClick={() => setIsPrivacyOpen(true)}
          className="flex items-center gap-2 text-[#4f46e5] font-black text-[10px] uppercase tracking-[0.2em] bg-indigo-50 px-6 py-3 rounded-full hover:bg-indigo-100 active:scale-95 transition-all"
        >
          <Shield size={14} />
          Política de Privacidad
        </button>
        <p className="text-[#020617] text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-center">
          EduPro Manager • Gestión Local Profesional • 2026
        </p>
      </footer>

      <PrivacyPolicyModal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)} 
      />
    </div>
  );
};