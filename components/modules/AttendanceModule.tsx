
import React, { useState, useEffect } from 'react';
import { Course, AttendanceRecord, AttendanceStatus, Student } from '../../types';
import { Check, X, Save, CheckCircle2, User, UsersRound } from 'lucide-react';

interface AttendanceModuleProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
}

type AttendanceMode = 'individual' | 'team';

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({ course, onUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>(course.attendance);
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>('individual');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalAttendance(course.attendance);
  }, [course.id, course.attendance]);

  const sortedStudents = [...course.students].sort((a, b) => a.name.localeCompare(b.name));

  // Group students by team
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

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    const existingIndex = localAttendance.findIndex(a => a.studentId === studentId && a.date === currentDate);
    let newAttendance = [...localAttendance];
    
    if (existingIndex > -1) {
      // Si el estado ya es el mismo, lo quitamos (opcional, pero profesional para corrección)
      if (newAttendance[existingIndex].status === status) {
        newAttendance.splice(existingIndex, 1);
      } else {
        newAttendance[existingIndex].status = status;
      }
    } else {
      newAttendance.push({
        date: currentDate,
        studentId,
        status
      });
    }
    setLocalAttendance(newAttendance);
    setSaveSuccess(false);
  };

  const toggleTeamAttendance = (teamId: string) => {
    const studentsInTeam = teamsMap[teamId];
    if (!studentsInTeam) return;

    const firstStudentId = studentsInTeam[0].id;
    const currentStatus = getStatus(firstStudentId);
    const nextStatus: AttendanceStatus = currentStatus === 'present' ? 'absent' : 'present';

    let newAttendance = [...localAttendance];
    studentsInTeam.forEach(student => {
      const idx = newAttendance.findIndex(a => a.studentId === student.id && a.date === currentDate);
      if (idx > -1) {
        newAttendance[idx].status = nextStatus;
      } else {
        newAttendance.push({
          date: currentDate,
          studentId: student.id,
          status: nextStatus
        });
      }
    });

    setLocalAttendance(newAttendance);
    setSaveSuccess(false);
  };

  const getStatus = (studentId: string): AttendanceStatus | 'unset' => {
    const record = localAttendance.find(a => a.studentId === studentId && a.date === currentDate);
    return record ? record.status : 'unset';
  };

  const getTeamStatus = (teamId: string): AttendanceStatus | 'unset' | 'mixed' => {
    const students = teamsMap[teamId];
    if (!students || students.length === 0) return 'unset';
    
    const statuses = students.map(s => getStatus(s.id));
    const allPresent = statuses.every(s => s === 'present');
    const allAbsent = statuses.every(s => s === 'absent');
    const allUnset = statuses.every(s => s === 'unset');

    if (allPresent) return 'present';
    if (allAbsent) return 'absent';
    if (allUnset) return 'unset';
    return 'mixed';
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate({ attendance: localAttendance });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
            <input 
              type="date" 
              className="flex-1 sm:flex-none bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
              value={currentDate}
              onChange={(e) => {
                setCurrentDate(e.target.value);
                setSaveSuccess(false);
              }}
            />

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner select-none">
              <button 
                onClick={() => setAttendanceMode('individual')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  attendanceMode === 'individual' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'
                }`}
              >
                <User size={14} />
                Indiv.
              </button>
              <button 
                onClick={() => setAttendanceMode('team')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  attendanceMode === 'team' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'
                }`}
              >
                <UsersRound size={14} />
                Equipo
              </button>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full sm:w-auto select-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
              saveSuccess ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white shadow-indigo-100'
            }`}
          >
            {saveSuccess ? <CheckCircle2 size={18} /> : isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
            {saveSuccess ? 'Guardado' : 'Guardar Lista'}
          </button>
        </div>
      </div>

      {sortedStudents.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold mb-2 uppercase tracking-widest text-[10px]">No hay alumnos registrados</p>
        </div>
      ) : attendanceMode === 'individual' ? (
        <div className="overflow-x-auto -mx-4 sm:mx-0 border-t sm:border border-slate-200 sm:rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left min-w-[320px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center w-12">N°</th>
                <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Alumno</th>
                <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Asistencia / Falta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedStudents.map((student, idx) => {
                const status = getStatus(student.id);
                return (
                  <tr key={student.id} className="active:bg-indigo-50/50 transition-colors">
                    <td className="px-4 py-4 text-[10px] text-slate-400 font-black text-center">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 leading-tight">{student.name}</span>
                        {student.teamId && <span className="text-[8px] font-black text-indigo-400 uppercase mt-0.5">E: {student.teamId}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => setStatus(student.id, 'present')}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 select-none border-2 ${
                            status === 'present' 
                              ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-100' 
                              : 'bg-white text-slate-300 border-slate-100 hover:border-green-200 hover:text-green-500'
                          }`}
                        >
                          <Check size={24} strokeWidth={4} />
                        </button>
                        <button 
                          onClick={() => setStatus(student.id, 'absent')}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 select-none border-2 ${
                            status === 'absent' 
                              ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-100' 
                              : 'bg-white text-slate-300 border-slate-100 hover:border-red-200 hover:text-red-500'
                          }`}
                        >
                          <X size={24} strokeWidth={4} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamIds.map(teamId => {
            const status = getTeamStatus(teamId);
            const students = teamsMap[teamId];
            return (
              <div 
                key={teamId}
                className={`p-5 rounded-3xl border-2 transition-all active:scale-[0.98] select-none ${
                  status === 'present' ? 'bg-green-50 border-green-200' :
                  status === 'absent' ? 'bg-red-50 border-red-200' :
                  status === 'mixed' ? 'bg-amber-50 border-amber-200' :
                  'bg-white border-slate-100'
                }`}
                onClick={() => toggleTeamAttendance(teamId)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl transition-colors ${
                    status === 'present' ? 'bg-green-500 text-white' :
                    status === 'absent' ? 'bg-red-500 text-white' :
                    'bg-indigo-100 text-indigo-600'
                  }`}>
                    <UsersRound size={22} />
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    status === 'present' ? 'bg-green-100 text-green-700' :
                    status === 'absent' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {teamId === 'Sin Equipo' ? 'S.E.' : `E-${teamId}`}
                  </div>
                </div>
                <div className="space-y-1 mb-4">
                  {students.slice(0, 2).map(s => (
                    <p key={s.id} className="text-[11px] font-bold text-slate-600 truncate">{s.name}</p>
                  ))}
                  {students.length > 2 && <p className="text-[9px] text-slate-400 font-bold uppercase">+{students.length - 2} más</p>}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 border-t border-slate-100 pt-3">
                  {status === 'present' ? <Check size={12} className="text-green-500"/> : null}
                  <span>{status === 'present' ? 'Presentes' : status === 'absent' ? 'Ausentes' : 'Marcar equipo'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
