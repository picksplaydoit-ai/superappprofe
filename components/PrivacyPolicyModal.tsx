import React from 'react';
import { ShieldCheck, X, Lock, Database, Globe, AlertTriangle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#4f46e5] text-white rounded-2xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#020617] leading-tight">Privacidad Total</h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Transparencia EduPro</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl active:scale-90 transition-transform"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-8 overflow-y-auto space-y-10">
          <section className="space-y-4">
            <h3 className="text-[#020617] font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Lock size={16} className="text-[#4f46e5]" /> Compromiso de Seguridad
            </h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              EduPro Manager respeta tu privacidad. Esta aplicación ha sido diseñada para funcionar de forma <strong>100% local</strong>. No recopilamos, almacenamos ni compartimos información personal de ningún tipo.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <Database className="text-[#4f46e5] mb-3" size={20} />
              <h4 className="font-black text-[10px] uppercase tracking-widest text-[#020617] mb-2">Almacenamiento</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-normal">
                Todos los datos (cursos, alumnos, asistencias y calificaciones) se guardan únicamente en la memoria interna de este dispositivo.
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <Globe className="text-[#4f46e5] mb-3" size={20} />
              <h4 className="font-black text-[10px] uppercase tracking-widest text-[#020617] mb-2">Sin Conexión</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-normal">
                EduPro Manager no utiliza servidores externos ni envía datos a internet a través de APIs de terceros.
              </p>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-[#020617] font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Responsabilidad
            </h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Al ser una gestión local, el usuario es el único responsable de respaldar su información mediante la función de exportación disponible en el Dashboard. La pérdida del dispositivo o borrado de caché de la app podría resultar en pérdida de datos.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              Última actualización: 2026
            </p>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-6 bg-slate-50 flex justify-center">
          <button 
            onClick={onClose}
            className="btn-action-blue w-full max-w-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};