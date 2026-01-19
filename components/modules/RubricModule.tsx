
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
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Estructura de Rúbrica</h2>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
            <CheckCircle2 size={16} />
            GUARDADO
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-inner">
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest text-center">Asistencia Mínima</label>
          <div className="relative">
            <input 
              type="number" 
              className="w-full bg-white px-3 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 font-black text-indigo-600 text-lg text-center"
              value={minAttendance}
              onChange={(e) => {
                setMinAttendance(e.target.value === '' ? '' : parseInt(e.target.value));
                setSaveSuccess(false);
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xs">%</span>
          </div>
        </div>
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 shadow-inner">
          <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest text-center">Nota Aprobatoria</label>
          <input 
            type="number" 
            className="w-full bg-white px-3 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 font-black text-indigo-600 text-lg text-center"
            value={minGrade}
            onChange={(e) => {
              setMinGrade(e.target.value === '' ? '' : parseInt(e.target.value));
              setSaveSuccess(false);
            }}
          />
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Criterios de Evaluación</h3>
          <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border-2 ${totalPercentage === 100 ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-500'}`}>
            SUMA: {totalPercentage}%
          </span>
        </div>
        
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-2 items-center bg-white p-2 pr-4 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-left-2 transition-all">
              <input 
                type="text" 
                placeholder="Nombre del rubro"
                className="flex-1 min-w-0 px-5 py-4 rounded-[1.5rem] border-none font-bold text-sm bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300"
                value={item.name}
                onChange={(e) => updateItem(item.id, e.target.value, item.percentage.toString())}
              />
              <div className="w-20 shrink-0 relative group">
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full px-2 py-4 rounded-2xl border-2 border-slate-100 text-center font-black text-indigo-600 text-lg outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all bg-slate-50/30"
                  value={item.percentage === 0 ? '' : item.percentage}
                  onChange={(e) => updateItem(item.id, item.name, e.target.value)}
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-black pointer-events-none">%</span>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="p-3 text-slate-300 hover:text-red-500 active:scale-90 transition-all bg-slate-50 rounded-2xl border border-slate-100 shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={addItem}
          className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={3} />
          Agregar Nuevo Rubro
        </button>
      </div>

      {totalPercentage !== 100 && (
        <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-5 rounded-[2rem] text-[10px] mb-8 border-2 border-amber-100 font-black uppercase tracking-widest leading-relaxed">
          <AlertCircle size={20} className="shrink-0" />
          <span>La suma de los porcentajes configurados debe ser exactamente el 100% para poder guardar.</span>
        </div>
      )}

      <button 
        onClick={handleSave}
        disabled={isSaving || totalPercentage !== 100}
        className={`w-full py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
          saveSuccess 
            ? 'bg-green-500 text-white' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 shadow-indigo-100'
        }`}
      >
        {saveSuccess ? <CheckCircle2 size={20} /> : isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
        {saveSuccess ? 'Configuración Guardada' : 'Guardar Rúbrica Académica'}
      </button>
    </div>
  );
};
