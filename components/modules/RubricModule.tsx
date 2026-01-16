
import React, { useState } from 'react';
import { Course, RubricItem } from '../../types';
import { Plus, Trash2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RubricModuleProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
}

export const RubricModule: React.FC<RubricModuleProps> = ({ course, onUpdate }) => {
  const [items, setItems] = useState<RubricItem[]>(course.rubric.items);
  const [minAttendance, setMinAttendance] = useState<number | ''>(course.rubric.minAttendance);
  const [minGrade, setMinGrade] = useState<number | ''>(course.rubric.minGrade);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const totalPercentage = items.reduce((sum, item) => sum + item.percentage, 0);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), name: '', percentage: 0 }]);
    setSaveSuccess(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    setSaveSuccess(false);
  };

  const updateItem = (id: string, name: string, percentageValue: string) => {
    const val = percentageValue === '' ? 0 : parseInt(percentageValue);
    setItems(items.map(i => i.id === id ? { ...i, name, percentage: val } : i));
    setSaveSuccess(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({
        rubric: {
          minAttendance: minAttendance === '' ? 0 : minAttendance,
          minGrade: minGrade === '' ? 0 : minGrade,
          items
        }
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Configuración de Rúbrica</h2>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-600 font-bold text-xs animate-in fade-in slide-in-from-right-2">
            <CheckCircle2 size={16} />
            GUARDADO
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Asistencia Mínima (%)</label>
          <input 
            type="number" 
            className="w-full px-3 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-600 text-lg text-center"
            value={minAttendance}
            onChange={(e) => {
              setMinAttendance(e.target.value === '' ? '' : parseInt(e.target.value));
              setSaveSuccess(false);
            }}
          />
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Nota Aprobatoria</label>
          <input 
            type="number" 
            className="w-full px-3 py-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-600 text-lg text-center"
            value={minGrade}
            onChange={(e) => {
              setMinGrade(e.target.value === '' ? '' : parseInt(e.target.value));
              setSaveSuccess(false);
            }}
          />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-slate-700">Criterios de Evaluación</h3>
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${totalPercentage === 100 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
            TOTAL: {totalPercentage}%
          </span>
        </div>
        
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 items-center animate-in fade-in slide-in-from-left-2">
              <input 
                type="text" 
                placeholder="Nombre del rubro (ej. Exámenes)"
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 font-bold text-sm bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                value={item.name}
                onChange={(e) => updateItem(item.id, e.target.value, item.percentage.toString())}
              />
              <div className="w-32 relative group">
                <input 
                  type="number" 
                  placeholder="%"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-center font-black text-indigo-600 text-lg outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
                  value={item.percentage === 0 ? '' : item.percentage}
                  onChange={(e) => updateItem(item.id, item.name, e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm pointer-events-none">%</span>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="p-3 text-slate-300 hover:text-red-500 active:scale-90 transition-all bg-slate-50 rounded-2xl border border-slate-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={addItem}
          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Agregar Rubro
        </button>
      </div>

      {totalPercentage !== 100 && (
        <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-2xl text-[10px] mb-6 border border-amber-100 font-black uppercase tracking-widest leading-relaxed">
          <AlertCircle size={18} className="shrink-0" />
          <span>La suma de los porcentajes debe ser exactamente 100%</span>
        </div>
      )}

      <button 
        onClick={handleSave}
        disabled={isSaving || totalPercentage !== 100}
        className={`w-full py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 ${
          saveSuccess 
            ? 'bg-green-500 text-white' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 shadow-indigo-100 active:scale-95'
        }`}
      >
        {saveSuccess ? <CheckCircle2 size={20} /> : isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
        {saveSuccess ? 'Configuración Guardada' : 'Guardar Configuración'}
      </button>
    </div>
  );
};
