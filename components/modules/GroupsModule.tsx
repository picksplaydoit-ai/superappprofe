
import React, { useState, useEffect } from 'react';
import { Course, Student } from '../../types';
import { Users, UserPlus, RefreshCcw, Trash2, Save, CheckCircle2 } from 'lucide-react';

interface GroupsModuleProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
}

export const GroupsModule: React.FC<GroupsModuleProps> = ({ course, onUpdate }) => {
  const [teamSize, setTeamSize] = useState<number | ''>(3);
  const [localStudents, setLocalStudents] = useState<Student[]>(course.students);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalStudents(course.students);
  }, [course.id]);

  const sortedStudents = [...localStudents].sort((a, b) => a.name.localeCompare(b.name));

  const generateAutoGroups = () => {
    const size = teamSize === '' ? 1 : teamSize;
    const shuffled = [...localStudents].sort(() => Math.random() - 0.5);
    const updatedStudents = shuffled.map((student, index) => ({
      ...student,
      teamId: `${Math.floor(index / size) + 1}`
    }));
    setLocalStudents(updatedStudents);
    setSaveSuccess(false);
  };

  const clearGroups = () => {
    setLocalStudents(localStudents.map(s => ({ ...s, teamId: undefined })));
    setSaveSuccess(false);
  };

  const manualAssign = (studentId: string, teamId: string) => {
    setLocalStudents(localStudents.map(s => s.id === studentId ? { ...s, teamId: teamId || undefined } : s));
    setSaveSuccess(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({ students: localStudents });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-xl font-bold text-slate-800">Gestión de Equipos</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
            saveSuccess ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
          }`}
        >
          {saveSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saveSuccess ? 'Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-1">Generación Automática</h3>
          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-bold text-slate-600">Alumnos por equipo:</span>
              <input 
                type="number" 
                inputMode="numeric"
                className="w-24 px-3 py-3 border-2 border-indigo-200 rounded-2xl text-center font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-100 text-lg"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value === '' ? '' : parseInt(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={generateAutoGroups}
                className="flex-1 bg-white text-indigo-600 border-2 border-indigo-200 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <RefreshCcw size={16} />
                Aleatorio
              </button>
              <button 
                onClick={clearGroups}
                className="px-4 py-3 bg-white text-slate-400 border border-slate-200 rounded-xl hover:text-red-500 transition-all shadow-sm"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-1">Edición Manual</h3>
          <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-4 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[9px]">Alumno</th>
                    <th className="px-4 py-4 text-right font-black text-slate-400 uppercase tracking-widest text-[9px]">ID Equipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedStudents.map(student => (
                    <tr key={student.id} className="active:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-4 font-bold text-slate-700 truncate max-w-[120px]">{student.name}</td>
                      <td className="px-4 py-4 text-right">
                        <input 
                          type="text"
                          inputMode="text"
                          placeholder="-"
                          className="w-16 px-2 py-2 border-2 border-slate-100 rounded-lg text-center font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-400"
                          value={student.teamId || ''}
                          onChange={(e) => manualAssign(student.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
