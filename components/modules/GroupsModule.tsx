
import React, { useState, useEffect, useMemo } from 'react';
import { Course, Student } from '../../types';
import { Users, UserPlus, RefreshCcw, Trash2, Save, CheckCircle2, UserCheck, LayoutGrid, ListFilter, PlusCircle } from 'lucide-react';

interface GroupsModuleProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
}

type GroupViewMode = 'grid' | 'list';

export const GroupsModule: React.FC<GroupsModuleProps> = ({ course, onUpdate }) => {
  const [teamSize, setTeamSize] = useState<number | ''>(3);
  const [localStudents, setLocalStudents] = useState<Student[]>(course.students);
  const [viewMode, setViewMode] = useState<GroupViewMode>('grid');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalStudents(course.students);
  }, [course.id, course.students]);

  // Agrupación de alumnos por equipo
  const teamsMap = useMemo(() => {
    return localStudents.reduce((acc, student) => {
      const teamId = student.teamId || 'Sin Asignar';
      if (!acc[teamId]) acc[teamId] = [];
      acc[teamId].push(student);
      return acc;
    }, {} as Record<string, Student[]>);
  }, [localStudents]);

  const teamIds = useMemo(() => {
    return Object.keys(teamsMap).sort((a, b) => {
      if (a === 'Sin Asignar') return 1;
      if (b === 'Sin Asignar') return -1;
      // Intento de orden numérico si es posible
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [teamsMap]);

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
    <div className="p-4 sm:p-6 bg-slate-50/30 min-h-[500px]">
      {/* Cabecera de Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Estructura de Grupos</h2>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Organización y Trabajo Colaborativo</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              title="Vista de Equipos"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              title="Asignación Manual"
            >
              <UserPlus size={18} />
            </button>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
              saveSuccess ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white shadow-indigo-100'
            }`}
          >
            {saveSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {saveSuccess ? 'Listo' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Controles de Generación */}
      <div className="mb-8 bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 w-full sm:w-auto">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumnos por Equipo</span>
          <input 
            type="number" 
            className="w-16 bg-transparent border-b-2 border-indigo-200 text-center font-black text-indigo-600 outline-none focus:border-indigo-500 transition-all"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value === '' ? '' : parseInt(e.target.value))}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={generateAutoGroups}
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
          >
            <RefreshCcw size={16} />
            Auto-Generar
          </button>
          <button 
            onClick={clearGroups}
            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
            title="Limpiar todos los equipos"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      {localStudents.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
           <Users size={48} className="mx-auto text-slate-200 mb-4" />
           <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Sin alumnos para agrupar</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* VISTA DE EQUIPOS AGRUPADOS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
          {teamIds.map(teamId => {
            const students = teamsMap[teamId];
            const isUnassigned = teamId === 'Sin Asignar';
            
            return (
              <div 
                key={teamId} 
                className={`bg-white rounded-[2.5rem] border-2 p-6 transition-all shadow-sm flex flex-col h-full ${
                  isUnassigned ? 'border-dashed border-slate-200' : 'border-indigo-100'
                }`}
              >
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUnassigned ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'}`}>
                      {isUnassigned ? <Users size={18} /> : <span className="font-black text-sm">{teamId}</span>}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">
                        {isUnassigned ? 'Pendientes' : `Equipo ${teamId}`}
                      </h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{students.length} Integrantes</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100/50">
                      <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[8px] font-black text-slate-300 border border-slate-100">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 truncate">{student.name}</span>
                    </div>
                  ))}
                </div>
                
                {!isUnassigned && (
                   <button 
                     onClick={() => students.forEach(s => manualAssign(s.id, ''))}
                     className="mt-4 w-full py-2.5 rounded-xl border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                   >
                     Deshacer Equipo
                   </button>
                )}
              </div>
            );
          })}
          
          <div className="bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white hover:border-indigo-300 transition-all" onClick={() => setViewMode('list')}>
            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all mb-3">
               <PlusCircle size={24} />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover:text-indigo-600">Asignar Manualmente</p>
          </div>
        </div>
      ) : (
        /* VISTA DE ASIGNACIÓN MANUAL (LISTA) */
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-10 duration-500">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <UserCheck size={20} className="text-indigo-600" />
               <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Lista de Asignación</h3>
             </div>
             <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identifica con números</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Nombre del Alumno</th>
                  <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] w-32">N° Equipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...localStudents].sort((a,b) => a.name.localeCompare(b.name)).map(student => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <input 
                          type="text" 
                          inputMode="numeric"
                          placeholder="-"
                          className="w-16 px-2 py-3 border-2 border-slate-100 rounded-2xl text-center font-black text-indigo-600 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all bg-slate-50/50 focus:bg-white"
                          value={student.teamId || ''}
                          onChange={(e) => manualAssign(student.id, e.target.value)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
