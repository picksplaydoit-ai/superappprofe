
import React, { useState, useEffect } from 'react';
import { Course, GradingType, Activity, Grade, Student } from '../../types';
import { Plus, Check, Save, User, ChevronRight, CheckCircle2, Trash2, Pencil, X, UsersRound, GraduationCap } from 'lucide-react';
import { ConfirmationModal } from '../ConfirmationModal';

interface ActivitiesModuleProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
}

export const ActivitiesModule: React.FC<ActivitiesModuleProps> = ({ course, onUpdate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    name: '',
    rubricItemId: course.rubric.items[0]?.id || '',
    gradingType: GradingType.SCALE,
    isTeam: false,
    maxPoints: 10
  });
  
  const [gradingActivity, setGradingActivity] = useState<Activity | null>(null);
  const [localGrades, setLocalGrades] = useState<Grade[]>(course.grades);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; activityId: string | null }>({
    isOpen: false,
    activityId: null
  });

  useEffect(() => {
    setLocalGrades(course.grades);
  }, [course.id, course.grades]);

  const handleAddOrUpdate = () => {
    if (!newActivity.name || !newActivity.rubricItemId) return;

    if (editingActivity) {
      const updatedActivity: Activity = {
        ...editingActivity,
        name: newActivity.name!,
        rubricItemId: newActivity.rubricItemId!,
        gradingType: newActivity.gradingType as GradingType,
        maxPoints: newActivity.maxPoints,
        isTeam: newActivity.isTeam || false
      };
      onUpdate({ activities: course.activities.map(a => a.id === editingActivity.id ? updatedActivity : a) });
      setEditingActivity(null);
    } else {
      const activity: Activity = {
        id: Math.random().toString(36).substr(2, 9),
        name: newActivity.name!,
        rubricItemId: newActivity.rubricItemId!,
        gradingType: newActivity.gradingType as GradingType,
        maxPoints: newActivity.maxPoints,
        isTeam: newActivity.isTeam || false
      };
      onUpdate({ activities: [...course.activities, activity] });
    }
    
    setNewActivity({ 
      name: '', 
      rubricItemId: course.rubric.items[0]?.id || '', 
      gradingType: GradingType.SCALE, 
      isTeam: false, 
      maxPoints: 10 
    });
    setShowAdd(false);
  };

  const startEdit = (e: React.MouseEvent, activity: Activity) => {
    e.preventDefault();
    e.stopPropagation(); 
    setEditingActivity(activity);
    setNewActivity({
      name: activity.name,
      rubricItemId: activity.rubricItemId,
      gradingType: activity.gradingType,
      isTeam: activity.isTeam,
      maxPoints: activity.maxPoints
    });
    setShowAdd(true);
  };

  const executeDeleteActivity = () => {
    const id = deleteModal.activityId;
    if (id) {
      onUpdate({ 
        activities: course.activities.filter(a => a.id !== id),
        grades: course.grades.filter(g => g.activityId !== id)
      });
    }
  };

  const handleSaveGrades = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({ grades: localGrades });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setGradingActivity(null);
      }, 1000);
    }, 600);
  };

  const updateIndividualGrade = (activityId: string, studentId: string, value: number) => {
    const existingIndex = localGrades.findIndex(g => g.activityId === activityId && g.studentId === studentId);
    let newGrades = [...localGrades];
    if (existingIndex > -1) newGrades[existingIndex].value = value;
    else newGrades.push({ activityId, studentId, value });
    setLocalGrades(newGrades);
  };

  const updateTeamGrade = (activityId: string, teamId: string, value: number) => {
    const studentsInTeam = course.students.filter(s => (s.teamId || 'Sin Equipo') === teamId);
    let newGrades = [...localGrades];
    
    studentsInTeam.forEach(student => {
      const existingIndex = newGrades.findIndex(g => g.activityId === activityId && g.studentId === student.id);
      if (existingIndex > -1) newGrades[existingIndex].value = value;
      else newGrades.push({ activityId, studentId: student.id, value });
    });
    
    setLocalGrades(newGrades);
  };

  const getGradeValue = (activityId: string, studentId: string) => {
    return localGrades.find(g => g.activityId === activityId && g.studentId === studentId)?.value || 0;
  };

  const sortedStudents = [...course.students].sort((a, b) => a.name.localeCompare(b.name));

  const teamsMap = course.students.reduce((acc, student) => {
    const teamId = student.teamId || 'Sin Equipo';
    if (!acc[teamId]) acc[teamId] = [];
    acc[teamId].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  const teamIds = Object.keys(teamsMap).sort((a, b) => {
    if (a === 'Sin Equipo') return 1;
    if (b === 'Sin Equipo') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Actividades</h2>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Seguimiento de tareas</p>
        </div>
        <button 
          type="button"
          onClick={() => {
            setShowAdd(!showAdd);
            setEditingActivity(null);
          }}
          className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 shadow-lg active:scale-95 transition-all"
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAdd && (
        <div className="mb-8 bg-white p-6 rounded-[2.5rem] border border-indigo-100 shadow-2xl shadow-indigo-100/50 animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-indigo-900 text-sm uppercase tracking-widest">{editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre</label>
              <input 
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 text-sm transition-all bg-slate-50"
                placeholder="Ej. Proyecto Parcial"
                value={newActivity.name}
                onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Rubro</label>
              <select 
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 text-sm bg-slate-50"
                value={newActivity.rubricItemId}
                onChange={(e) => setNewActivity({...newActivity, rubricItemId: e.target.value})}
              >
                {course.rubric.items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Calificación</label>
              <select 
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 text-sm bg-slate-50"
                value={newActivity.gradingType}
                onChange={(e) => setNewActivity({...newActivity, gradingType: e.target.value as GradingType})}
              >
                <option value={GradingType.CHECK}>Check (Entregado)</option>
                <option value={GradingType.SCALE}>Escala 0-100</option>
                <option value={GradingType.POINTS}>Puntos Directos</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-8 px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={newActivity.isTeam}
                  onChange={(e) => setNewActivity({...newActivity, isTeam: e.target.checked})}
                />
                <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600 transition-colors">Calificar por Equipo</span>
            </label>

            {newActivity.gradingType === GradingType.POINTS && (
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Puntos Totales:</label>
                <input 
                  type="number" 
                  className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-center font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-50"
                  value={newActivity.maxPoints === 0 ? '' : newActivity.maxPoints}
                  onChange={(e) => setNewActivity({...newActivity, maxPoints: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
             <button type="button" onClick={() => {setShowAdd(false); setEditingActivity(null);}} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
             <button type="button" onClick={handleAddOrUpdate} className="bg-indigo-600 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                {editingActivity ? 'Guardar Cambios' : 'Crear Actividad'}
             </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {course.activities.map((activity) => {
          const rubricName = course.rubric.items.find(i => i.id === activity.rubricItemId)?.name || 'Sin Rubro';
          
          return (
            <div key={activity.id} className="bg-white border border-slate-200 rounded-[2rem] p-5 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 group flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activity.isTeam ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {activity.isTeam ? <UsersRound size={28} /> : <User size={28} />}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800 leading-tight mb-1">{activity.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{rubricName}</span>
                    {activity.isTeam && (
                      <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">Por Equipo</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="hidden sm:flex items-center gap-2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    type="button"
                    onClick={(e) => startEdit(e, activity)} 
                    className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                   >
                    <Pencil size={20}/>
                   </button>
                   <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal({ isOpen: true, activityId: activity.id });
                    }} 
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                   >
                    <Trash2 size={20}/>
                   </button>
                 </div>
                 
                 <button 
                   onClick={() => setGradingActivity(activity)}
                   className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                 >
                   Calificar
                   <ChevronRight size={16} strokeWidth={3}/>
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {gradingActivity && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${gradingActivity.isTeam ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                   {gradingActivity.isTeam ? <UsersRound size={24}/> : <User size={24}/>}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight">Calificar: {gradingActivity.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {gradingActivity.isTeam ? 'CAPTURA POR EQUIPOS' : 'CAPTURA INDIVIDUAL'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setGradingActivity(null)}
                className="p-3 text-slate-300 hover:text-slate-500 transition-colors bg-white rounded-2xl shadow-sm"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 bg-white">
              <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 p-2">
                <div className="space-y-1">
                  {gradingActivity.isTeam ? (
                    teamIds.map(teamId => {
                      const students = teamsMap[teamId];
                      const representativeGrade = getGradeValue(gradingActivity.id, students[0].id);
                      return (
                        <div key={teamId} className="flex justify-between items-center py-4 px-6 hover:bg-white rounded-[1.5rem] transition-all border border-transparent hover:border-slate-100 group">
                          <div className="flex flex-col pr-4">
                            <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Equipo {teamId}</span>
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[250px]">
                              {students.map(s => s.name).join(', ')}
                            </span>
                          </div>
                          <GradeInput 
                            activity={gradingActivity} 
                            value={representativeGrade} 
                            onChange={(val) => updateTeamGrade(gradingActivity.id, teamId, val)} 
                          />
                        </div>
                      );
                    })
                  ) : (
                    sortedStudents.map(student => (
                      <div key={student.id} className="flex justify-between items-center py-4 px-6 hover:bg-white rounded-[1.5rem] transition-all border border-transparent hover:border-slate-100 group">
                         <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                               {student.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{student.name}</span>
                         </div>
                         <GradeInput 
                           activity={gradingActivity} 
                           value={getGradeValue(gradingActivity.id, student.id)} 
                           onChange={(val) => updateIndividualGrade(gradingActivity.id, student.id, val)} 
                         />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button 
                onClick={() => setGradingActivity(null)}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveGrades}
                disabled={isSaving}
                className={`px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3 ${
                  saveSuccess ? 'bg-green-500 text-white shadow-green-100' : 'bg-indigo-600 text-white shadow-indigo-100'
                }`}
              >
                {saveSuccess ? <CheckCircle2 size={18} /> : isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                {saveSuccess ? 'Guardado' : 'Guardar Notas'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        title="¿Eliminar actividad?"
        message="Se borrarán permanentemente todas las calificaciones vinculadas a esta actividad. Esta acción no se puede deshacer."
        onConfirm={executeDeleteActivity}
        onCancel={() => setDeleteModal({ isOpen: false, activityId: null })}
      />
    </div>
  );
};

const GradeInput: React.FC<{ 
  activity: Activity, 
  value: number, 
  onChange: (val: number) => void 
}> = ({ activity, value, onChange }) => {
  if (activity.gradingType === GradingType.CHECK) {
    return (
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(value === 100 ? 0 : 100); }}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${
          value === 100 ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300'
        }`}
      >
        <Check size={24} strokeWidth={4} />
      </button>
    );
  }
  
  return (
    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
      <div className="relative">
        <input 
          type="number"
          inputMode="decimal"
          className="w-28 px-3 py-3 border-2 border-slate-200 rounded-2xl text-center font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-100 bg-white text-lg transition-all"
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            onChange(val);
          }}
        />
        {activity.gradingType === GradingType.POINTS && (
          <span className="absolute -top-3 -right-2 bg-indigo-100 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">
            /{activity.maxPoints}
          </span>
        )}
      </div>
    </div>
  );
};
