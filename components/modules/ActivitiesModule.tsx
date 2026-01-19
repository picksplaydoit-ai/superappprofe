
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

  const startEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setNewActivity({
      name: activity.name,
      rubricItemId: activity.rubricItemId,
      gradingType: activity.gradingType,
      isTeam: activity.isTeam,
      maxPoints: activity.maxPoints
    });
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDeleteActivity = () => {
    const id = deleteModal.activityId;
    if (id) {
      onUpdate({ 
        activities: course.activities.filter(a => a.id !== id),
        grades: course.grades.filter(g => g.studentId !== id && g.activityId !== id)
      });
    }
    setDeleteModal({ isOpen: false, activityId: null });
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
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Actividades</h2>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Evaluación del Desempeño</p>
        </div>
        <button 
          type="button"
          onClick={() => {
            if (showAdd) setEditingActivity(null);
            setShowAdd(!showAdd);
          }}
          className={`p-4 rounded-2xl shadow-lg active:scale-95 transition-all ${showAdd ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white shadow-indigo-100'}`}
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAdd && (
        <div className="mb-8 bg-white p-6 rounded-[2.5rem] border border-indigo-50 shadow-2xl shadow-indigo-100/20 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
               {editingActivity ? <Pencil size={18} /> : <Plus size={18} />}
            </div>
            <h3 className="font-black text-indigo-900 text-[10px] uppercase tracking-[0.2em]">{editingActivity ? 'Modificar Actividad' : 'Nueva Actividad Académica'}</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-5 mb-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest px-1">Título de la Actividad</label>
              <input 
                className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 text-sm transition-all bg-slate-50 focus:bg-white"
                placeholder="Ej. Proyecto Final"
                value={newActivity.name}
                onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest px-1">Rubro Asociado</label>
                <select 
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-700 text-sm bg-slate-50 appearance-none"
                  value={newActivity.rubricItemId}
                  onChange={(e) => setNewActivity({...newActivity, rubricItemId: e.target.value})}
                >
                  {course.rubric.items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest px-1">Tipo de Calificación</label>
                <select 
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-700 text-sm bg-slate-50 appearance-none"
                  value={newActivity.gradingType}
                  onChange={(e) => setNewActivity({...newActivity, gradingType: e.target.value as GradingType})}
                >
                  <option value={GradingType.CHECK}>Check (Entregado)</option>
                  <option value={GradingType.SCALE}>Escala (0-100)</option>
                  <option value={GradingType.POINTS}>Puntos / Firmas</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 mb-8 px-1">
            <label className="flex items-center gap-4 cursor-pointer group py-2">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={newActivity.isTeam}
                  onChange={(e) => setNewActivity({...newActivity, isTeam: e.target.checked})}
                />
                <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">Evaluar por Equipos</span>
            </label>

            {newActivity.gradingType === GradingType.POINTS && (
              <div className="flex items-center gap-4 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100/50 w-full animate-in slide-in-from-left-2">
                <label className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex-1">Meta de Puntos / Firmas:</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-24 bg-white px-4 py-3 border-2 border-indigo-100 rounded-2xl text-center font-black text-indigo-600 outline-none focus:border-indigo-400 shadow-sm"
                    value={newActivity.maxPoints === 0 ? '' : newActivity.maxPoints}
                    onChange={(e) => setNewActivity({...newActivity, maxPoints: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                  />
                  <span className="absolute -top-3 -right-2 bg-indigo-600 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black">MAX</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-50">
             <button type="button" onClick={() => {setShowAdd(false); setEditingActivity(null);}} className="order-2 sm:order-1 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all text-center">Cancelar</button>
             <button type="button" onClick={handleAddOrUpdate} className="order-1 sm:order-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all text-center">
                {editingActivity ? 'Actualizar' : 'Guardar Actividad'}
             </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {course.activities.length === 0 ? (
          <div className="py-24 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] px-8">
            <GraduationCap size={56} strokeWidth={1} className="mx-auto text-slate-200 mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Comienza agregando una actividad para evaluar</p>
          </div>
        ) : (
          course.activities.map((activity) => {
            const rubricName = course.rubric.items.find(i => i.id === activity.rubricItemId)?.name || 'General';
            
            return (
              <div key={activity.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${activity.isTeam ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                      {activity.isTeam ? <UsersRound size={26} /> : <User size={26} />}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 leading-tight mb-1 text-base">{activity.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{rubricName}</span>
                        {activity.isTeam && (
                          <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Equipo</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button 
                      type="button"
                      onClick={() => startEdit(activity)} 
                      className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                    >
                      <Pencil size={18}/>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeleteModal({ isOpen: true, activityId: activity.id })} 
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setGradingActivity(activity)}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-indigo-600 shadow-lg active:scale-95"
                >
                  Capturar Notas
                  <ChevronRight size={16} strokeWidth={3}/>
                </button>
              </div>
            );
          })
        )}
      </div>

      {gradingActivity && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-indigo-50/20">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl shadow-sm ${gradingActivity.isTeam ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                   {gradingActivity.isTeam ? <UsersRound size={22}/> : <User size={22}/>}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 leading-tight">{gradingActivity.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {gradingActivity.isTeam ? 'Evaluación Grupal' : 'Evaluación Individual'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setGradingActivity(null)}
                className="p-3 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-2xl shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-white">
              <div className="space-y-2">
                {gradingActivity.isTeam ? (
                  teamIds.map(teamId => {
                    const students = teamsMap[teamId];
                    const representativeGrade = getGradeValue(gradingActivity.id, students[0].id);
                    return (
                      <div key={teamId} className="flex justify-between items-center py-5 px-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 group transition-all active:scale-[0.98]">
                        <div className="flex flex-col pr-4 overflow-hidden">
                          <span className="text-xs font-black text-indigo-600 uppercase tracking-wide">Equipo {teamId}</span>
                          <span className="text-[10px] text-slate-400 font-bold truncate max-w-[180px]">
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
                    <div key={student.id} className="flex justify-between items-center py-4 px-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:bg-white transition-all">
                       <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 shrink-0">
                             {student.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-700 truncate">{student.name}</span>
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
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => setGradingActivity(null)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveGrades}
                disabled={isSaving}
                className={`flex-[2] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                  saveSuccess ? 'bg-green-500 text-white shadow-green-100' : 'bg-indigo-600 text-white shadow-indigo-100 disabled:opacity-50'
                }`}
              >
                {saveSuccess ? <CheckCircle2 size={18} /> : isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                {saveSuccess ? 'Guardado con éxito' : 'Guardar Calificaciones'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        title="¿Eliminar permanentemente?"
        message="Se perderán todos los datos capturados de esta actividad. Esta acción es definitiva."
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
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm border-2 ${
          value === 100 ? 'bg-green-500 text-white border-green-400' : 'bg-white text-slate-200 border-slate-100'
        }`}
      >
        <Check size={28} strokeWidth={4} />
      </button>
    );
  }
  
  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <div className="relative group">
        <input 
          type="number"
          inputMode="decimal"
          className="w-24 px-4 py-4 border-2 border-slate-200 rounded-2xl text-center font-black text-indigo-600 outline-none focus:border-indigo-500 bg-white text-lg transition-all shadow-sm"
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            onChange(val);
          }}
        />
        {activity.gradingType === GradingType.POINTS && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-indigo-100 whitespace-nowrap">
            de {activity.maxPoints}
          </div>
        )}
      </div>
    </div>
  );
};
