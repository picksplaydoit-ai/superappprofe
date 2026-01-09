
import React, { useState, useEffect } from 'react';
import { Course, GradingType, Activity, Grade, Student } from '../../types';
import { Plus, Check, Save, User, Users as UsersIcon, ChevronDown, CheckCircle2, Trash2, Pencil, X, UsersRound } from 'lucide-react';
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
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [localGrades, setLocalGrades] = useState<Grade[]>(course.grades);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal State
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
      if (expandedActivityId === id) setExpandedActivityId(null);
    }
  };

  const handleSaveGrades = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({ grades: localGrades });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  const updateIndividualGrade = (activityId: string, studentId: string, value: number) => {
    const existingIndex = localGrades.findIndex(g => g.activityId === activityId && g.studentId === studentId);
    let newGrades = [...localGrades];
    if (existingIndex > -1) newGrades[existingIndex].value = value;
    else newGrades.push({ activityId, studentId, value });
    setLocalGrades(newGrades);
    setSaveSuccess(false);
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
    setSaveSuccess(false);
  };

  const getGradeValue = (activityId: string, studentId: string) => {
    return localGrades.find(g => g.activityId === activityId && g.studentId === studentId)?.value || 0;
  };

  const sortedStudents = [...course.students].sort((a, b) => a.name.localeCompare(b.name));

  // Agrupación por equipos para la vista de calificación
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
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-800">Actividades</h2>
          {expandedActivityId && (
            <button 
              type="button"
              onClick={handleSaveGrades}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 ${
                saveSuccess ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {saveSuccess ? <CheckCircle2 size={14} /> : isSaving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
              {saveSuccess ? 'Guardado' : 'Guardar Notas'}
            </button>
          )}
        </div>
        <button 
          type="button"
          onClick={() => {
            setShowAdd(!showAdd);
            setEditingActivity(null);
          }}
          className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 shadow-md active:scale-95 transition-all"
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAdd && (
        <div className="mb-8 bg-white p-5 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-50/50 animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-indigo-900 text-sm">{editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Nombre</label>
              <input 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                placeholder="Ej. Proyecto Parcial"
                value={newActivity.name}
                onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Rubro</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm bg-white"
                value={newActivity.rubricItemId}
                onChange={(e) => setNewActivity({...newActivity, rubricItemId: e.target.value})}
              >
                {course.rubric.items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Tipo Calificación</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm bg-white"
                value={newActivity.gradingType}
                onChange={(e) => setNewActivity({...newActivity, gradingType: e.target.value as GradingType})}
              >
                <option value={GradingType.CHECK}>Check (Entregado)</option>
                <option value={GradingType.SCALE}>Escala 0-100</option>
                <option value={GradingType.POINTS}>Trabajos Totales</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-5 px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={newActivity.isTeam}
                  onChange={(e) => setNewActivity({...newActivity, isTeam: e.target.checked})}
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Calificar por Equipo</span>
            </label>

            {newActivity.gradingType === GradingType.POINTS && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-400">Puntos Totales:</label>
                <input 
                  type="number" 
                  className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-center font-bold text-indigo-600"
                  value={newActivity.maxPoints}
                  onChange={(e) => setNewActivity({...newActivity, maxPoints: parseInt(e.target.value) || 0})}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
             <button type="button" onClick={() => {setShowAdd(false); setEditingActivity(null);}} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
             <button type="button" onClick={handleAddOrUpdate} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                {editingActivity ? 'Guardar Cambios' : 'Crear Actividad'}
             </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {course.activities.map((activity) => {
          const isExpanded = expandedActivityId === activity.id;
          const rubricName = course.rubric.items.find(i => i.id === activity.rubricItemId)?.name || 'Sin Rubro';
          
          return (
            <div key={activity.id} className={`group border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'border-indigo-400 shadow-xl ring-4 ring-indigo-50 bg-white' : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md'}`}>
              <div 
                className={`flex items-center justify-between p-4 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-indigo-50/30' : 'bg-white'}`}
                onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl transition-all ${activity.isTeam ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {activity.isTeam ? <UsersRound size={20} /> : <User size={20} />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isExpanded ? 'text-indigo-900' : 'text-slate-800'}`}>{activity.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rubricName}</span>
                      {activity.isTeam && <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Equipo</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1">
                     <button 
                      type="button"
                      onClick={(e) => startEdit(e, activity)} 
                      className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Editar"
                     >
                      <Pencil size={16}/>
                     </button>
                     <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteModal({ isOpen: true, activityId: activity.id });
                      }} 
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                     >
                      <Trash2 size={16}/>
                     </button>
                   </div>
                   <div className={`p-1.5 rounded-lg transition-all ${isExpanded ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'text-slate-200'}`}>
                      <ChevronDown size={20}/>
                   </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-white border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                  <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden p-2">
                    <p className="text-[10px] text-slate-400 font-bold mb-3 px-2 uppercase tracking-widest">
                      {activity.isTeam ? 'Calificación por Equipos' : 'Calificación Individual'}
                    </p>
                    
                    <div className="space-y-1">
                      {activity.isTeam ? (
                        teamIds.map(teamId => {
                          const students = teamsMap[teamId];
                          const representativeGrade = getGradeValue(activity.id, students[0].id);
                          return (
                            <div key={teamId} className="flex justify-between items-center py-2 px-3 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700">Equipo: {teamId}</span>
                                <span className="text-[9px] text-slate-400 truncate max-w-[200px]">
                                  {students.map(s => s.name).join(', ')}
                                </span>
                              </div>
                              <GradeInput 
                                activity={activity} 
                                value={representativeGrade} 
                                onChange={(val) => updateTeamGrade(activity.id, teamId, val)} 
                              />
                            </div>
                          );
                        })
                      ) : (
                        sortedStudents.map(student => (
                          <div key={student.id} className="flex justify-between items-center py-2 px-3 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                             <span className="text-xs font-bold text-slate-700">{student.name}</span>
                             <GradeInput 
                               activity={activity} 
                               value={getGradeValue(activity.id, student.id)} 
                               onChange={(val) => updateIndividualGrade(activity.id, student.id, val)} 
                             />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

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
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
          value === 100 ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-100 text-slate-300'
        }`}
      >
        <Check size={18} strokeWidth={4} />
      </button>
    );
  }
  
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <input 
        type="number"
        className="w-14 px-2 py-1 border border-slate-200 rounded-lg text-center font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-xs"
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value) || 0;
          onChange(val);
        }}
      />
      {activity.gradingType === GradingType.POINTS && (
        <span className="text-[10px] font-black text-slate-300">/ {activity.maxPoints}</span>
      )}
    </div>
  );
};
