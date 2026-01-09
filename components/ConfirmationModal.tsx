
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Eliminar permanentemente",
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-red-50 p-4 rounded-2xl text-red-500">
              <AlertTriangle size={32} />
            </div>
            <button 
              onClick={onCancel}
              className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="flex-1 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
