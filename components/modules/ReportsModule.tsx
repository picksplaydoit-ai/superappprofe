
import React, { useState, useMemo } from 'react';
import { Course, AttendanceRecord, StudentStatus } from '../../types';
import { FileSpreadsheet, Loader2, AlertCircle, TrendingUp, TrendingDown, UserX, Percent, FileWarning, Filter, ChevronDown, ChevronUp, AlertOctagon } from 'lucide-react';

interface ReportsModuleProps {
  course: Course;
}

type ReportType = 'attendance' | 'grades' | 'unsubmitted';

export const ReportsModule: React.FC<ReportsModuleProps> = ({ course }) => {
  const [reportType, setReportType] = useState<ReportType>('attendance');
  const [activeFilter, setActiveFilter] = useState<string>('-1');
  const [selectedRubricId, setSelectedRubricId] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const filterOptions = [
    { id: '-1', name: 'Todo el Curso', group: 'General' },
    { id: 'Q1', name: '1er Trimestre', group: 'Trimestres' },
    { id: 'Q2', name: '2do Trimestre', group: 'Trimestres' },
    { id: 'Q3', name: '3er Trimestre', group: 'Trimestres' },
    { id: 'Q4', name: '4to Trimestre', group: 'Trimestres' },
    { id: '0', name: 'Enero', group: 'Meses' },
    { id: '1', name: 'Febrero', group: 'Meses' },
    { id: '2', name: 'Marzo', group: 'Meses' },
    { id: '3', name: 'Abril', group: 'Meses' },
    { id: '4', name: 'Mayo', group: 'Meses' },
    { id: '5', name: 'Junio', group: 'Meses' },
    { id: '6', name: 'Julio', group: 'Meses' },
    { id: '7', name: 'Agosto', group: 'Meses' },
    { id: '8', name: 'Septiembre', group: 'Meses' },
    { id: '9', name: 'Octubre', group: 'Meses' },
    { id: '10', name: 'Noviembre', group: 'Meses' },
    { id: '11', name: 'Diciembre', group: 'Meses' },
  ];

  const allAttendanceDates = useMemo(() => {
    return Array.from(new Set(course.attendance.map((a: AttendanceRecord) => a.date))).sort();
  }, [course.attendance]);

  const filteredDates = useMemo(() => {
    if (activeFilter === '-1') return allAttendanceDates;
    let targetMonths: number[] = [];
    if (activeFilter.startsWith('Q')) {
      if (activeFilter === 'Q1') targetMonths = [0, 1, 2];
      else if (activeFilter === 'Q2') targetMonths = [3, 4, 5];
      else if (activeFilter === 'Q3') targetMonths = [6, 7, 8];
      else if (activeFilter === 'Q4') targetMonths = [9, 10, 11];
    } else {
      targetMonths = [parseInt(activeFilter)];
    }
    return allAttendanceDates.filter(dateStr => {
      const d = new Date(dateStr + 'T00:00:00Z');
      return targetMonths.includes(d.getUTCMonth());
    });
  }, [allAttendanceDates, activeFilter]);

  const getStudentStats = (studentId: string) => {
    const recordsInPeriod = course.attendance.filter(a => a.studentId === studentId && filteredDates.includes(a.date));
    const presentInPeriod = recordsInPeriod.filter(a => a.status === 'present').length;
    const periodPossible = filteredDates.length;
    const periodPct = periodPossible > 0 ? (presentInPeriod / periodPossible) * 100 : 0;

    const globalRecords = course.attendance.filter(a => a.studentId === studentId && a.status === 'present').length;
    const globalPossible = allAttendanceDates.length;
    const globalPct = globalPossible > 0 ? (globalRecords / globalPossible) * 100 : 0;

    let finalGrade = 0;
    const weightedRubricScores: { [key: string]: number } = {};

    course.rubric.items.forEach(item => {
      const activities = course.activities.filter(a => a.rubricItemId === item.id);
      if (activities.length === 0) {
        weightedRubricScores[item.id] = 0;
        return;
      }
      let pointsEarned = 0;
      activities.forEach(act => {
        const grade = course.grades.find(g => g.activityId === act.id && g.studentId === studentId)?.value || 0;
        pointsEarned += (act.gradingType === 'POINTS' && act.maxPoints) ? (grade / act.maxPoints) * 100 : grade;
      });
      const avg = pointsEarned / activities.length;
      const weightedValue = (avg * item.percentage) / 100;
      weightedRubricScores[item.id] = weightedValue;
      finalGrade += weightedValue;
    });

    const missingActivities = course.activities.filter(activity => {
      if (selectedRubricId !== 'all' && activity.rubricItemId !== selectedRubricId) return false;
      const gradeRecord = course.grades.find(g => g.activityId === activity.id && g.studentId === studentId);
      return !gradeRecord || gradeRecord.value === 0;
    });

    let status: StudentStatus = 'Aprobado';
    if (globalPct < course.rubric.minAttendance) status = 'Sin Derecho';
    else if (finalGrade < course.rubric.minGrade) status = 'Reprobado';

    return { 
      presentInPeriod, 
      absentInPeriod: periodPossible - presentInPeriod, 
      periodPct, 
      finalGrade, 
      weightedRubricScores, 
      status, 
      globalPct, 
      periodPossible,
      missingActivities
    };
  };

  const sortedStudents = useMemo(() => [...course.students].sort((a, b) => a.name.localeCompare(b.name)), [course.students]);

  const groupStats = useMemo(() => {
    if (sortedStudents.length === 0) return null;
    const allStats = sortedStudents.map(s => getStudentStats(s.id));
    const total = sortedStudents.length;
    const approved = allStats.filter(s => s.status === 'Aprobado').length;
    const failed = allStats.filter(s => s.status === 'Reprobado').length;
    const noRight = allStats.filter(s => s.status === 'Sin Derecho').length;
    const avgAttendance = allStats.reduce((sum, s) => sum + s.globalPct, 0) / (total || 1);
    return { approved, approvedPct: (approved / total) * 100, failed, failedPct: (failed / total) * 100, noRight, noRightPct: (noRight / total) * 100, avgAttendance };
  }, [sortedStudents, course, allAttendanceDates, selectedRubricId]);

  const exportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        let csv = "\uFEFF"; 
        const periodLabel = filterOptions.find(f => f.id === activeFilter)?.name || "Total";
        
        if (reportType === 'attendance') {
          csv += `Reporte de Asistencia,Grupo: ${course.groupName},Periodo: ${periodLabel}\nNombre del Alumno,Asistencias,Faltas,% Asistencia Periodo\n`;
          sortedStudents.forEach(s => {
            const stats = getStudentStats(s.id);
            csv += `"${s.name}",${stats.presentInPeriod},${stats.absentInPeriod},${stats.periodPct.toFixed(1)}%\n`;
          });
        } else if (reportType === 'grades') {
          csv += `Reporte de Calificaciones,Grupo: ${course.groupName}\nNombre del Alumno,${course.rubric.items.map(i => `"${i.name} pts"`).join(",")},Nota Final,Asistencia %,Estatus\n`;
          sortedStudents.forEach(s => {
            const stats = getStudentStats(s.id);
            const rScores = course.rubric.items.map(i => (stats.weightedRubricScores[i.id] || 0).toFixed(1)).join(",");
            csv += `"${s.name}",${rScores},${stats.finalGrade.toFixed(1)},${stats.globalPct.toFixed(1)}%,"${stats.status}"\n`;
          });
        } else {
          const rubricLabel = selectedRubricId === 'all' ? 'Todos los Rubros' : course.rubric.items.find(i => i.id === selectedRubricId)?.name || '';
          csv += `Reporte de Pendientes,Grupo: ${course.groupName},Rubro: ${rubricLabel}\nNombre del Alumno,Cant. Pendientes,Actividades Específicas\n`;
          sortedStudents.forEach(s => {
            const stats = getStudentStats(s.id);
            const missingNames = stats.missingActivities.map(a => a.name).join(" | ");
            csv += `"${s.name}",${stats.missingActivities.length},"${missingNames}"\n`;
          });
        }
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `EduPro_${course.groupName}_${reportType}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      } finally { setIsExporting(false); }
    }, 500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
        <button onClick={() => setReportType('attendance')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === 'attendance' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>Asistencia</button>
        <button onClick={() => setReportType('grades')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === 'grades' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}>Calificaciones</button>
        <button onClick={() => setReportType('unsubmitted')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === 'unsubmitted' ? 'bg-white shadow-md text-red-600' : 'text-slate-500'}`}>Pendientes</button>
      </div>

      {reportType === 'grades' && groupStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox label="Aprobados" value={groupStats.approved} subText={`${groupStats.approvedPct.toFixed(0)}%`} icon={TrendingUp} color="green" />
          <StatBox label="Reprobados" value={groupStats.failed} subText={`${groupStats.failedPct.toFixed(0)}%`} icon={TrendingDown} color="red" />
          <StatBox label="Sin Derecho" value={groupStats.noRight} subText={`${groupStats.noRightPct.toFixed(0)}%`} icon={UserX} color="amber" />
          <StatBox label="Asist. Grupal" value={`${groupStats.avgAttendance.toFixed(0)}%`} subText="Global" icon={Percent} color="indigo" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {reportType === 'attendance' && (
          <div className="flex-1 relative group">
            <select className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-black uppercase outline-none focus:border-indigo-500 shadow-sm appearance-none" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
              {filterOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={16} /></div>
          </div>
        )}

        {reportType === 'unsubmitted' && (
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500"><Filter size={16} /></div>
            <select className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-10 py-3.5 text-xs font-black uppercase outline-none focus:border-indigo-500 shadow-sm appearance-none" value={selectedRubricId} onChange={(e) => setSelectedRubricId(e.target.value)}>
              <option value="all">Filtrar: Todos los Rubros</option>
              {course.rubric.items.map(item => <option key={item.id} value={item.id}>Rubro: {item.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={16} /></div>
          </div>
        )}

        <button onClick={exportCSV} disabled={isExporting || sortedStudents.length === 0} className="bg-green-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />} 
          EXPORTAR CSV
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10">Alumno</th>
                {reportType === 'attendance' && (
                  <>
                    <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Asist</th>
                    <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Faltas</th>
                    <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">% Periodo</th>
                  </>
                )}
                {reportType === 'grades' && (
                  <>
                    {course.rubric.items.map(item => (
                      <th key={item.id} className="px-4 py-4 text-center text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                        <div className="flex flex-col"><span>{item.name}</span><span className="text-indigo-400">({item.percentage}%)</span></div>
                      </th>
                    ))}
                    <th className="px-4 py-4 text-center text-[9px] font-black text-indigo-600 uppercase bg-indigo-50/30">Final</th>
                    <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                  </>
                )}
                {reportType === 'unsubmitted' && (
                  <>
                    <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Pendientes</th>
                    <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Acción</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map(student => {
                const stats = getStudentStats(student.id);
                const isExpanded = expandedStudentId === student.id;
                return (
                  <React.Fragment key={student.id}>
                    <tr className={`transition-colors ${isExpanded ? 'bg-slate-50' : 'active:bg-slate-50'}`} onClick={() => reportType === 'unsubmitted' && setExpandedStudentId(isExpanded ? null : student.id)}>
                      <td className={`px-5 py-4 sticky left-0 z-10 border-r border-slate-50 ${isExpanded ? 'bg-slate-50' : 'bg-white'}`}>
                        <span className="text-xs font-bold text-slate-700 truncate block max-w-[130px]">{student.name}</span>
                      </td>
                      {reportType === 'attendance' && (
                        <>
                          <td className="px-4 py-4 text-center text-green-600 font-black text-xs">{stats.presentInPeriod}</td>
                          <td className="px-4 py-4 text-center text-red-600 font-black text-xs">{stats.absentInPeriod}</td>
                          <td className="px-4 py-4 text-center"><span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${stats.periodPct >= course.rubric.minAttendance ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{stats.periodPct.toFixed(0)}%</span></td>
                        </>
                      )}
                      {reportType === 'grades' && (
                        <>
                          {course.rubric.items.map(item => <td key={item.id} className="px-4 py-4 text-center text-[11px] font-black text-slate-800">{(stats.weightedRubricScores[item.id] || 0).toFixed(1)}</td>)}
                          <td className="px-4 py-4 text-center bg-indigo-50/20 font-black text-slate-900 text-sm">{stats.finalGrade.toFixed(1)}</td>
                          <td className="px-4 py-4 text-center"><div className={`inline-block px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${stats.status === 'Aprobado' ? 'bg-green-100 text-green-700' : stats.status === 'Reprobado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{stats.status}</div></td>
                        </>
                      )}
                      {reportType === 'unsubmitted' && (
                        <>
                          <td className="px-4 py-4 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${stats.missingActivities.length > 0 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>{stats.missingActivities.length}</span></td>
                          <td className="px-4 py-4 text-center"><button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all">{isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button></td>
                        </>
                      )}
                    </tr>
                    {reportType === 'unsubmitted' && isExpanded && (
                      <tr className="bg-slate-50 animate-in fade-in slide-in-from-top-1 duration-200">
                        <td colSpan={3} className="px-6 py-6 border-t border-slate-200">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-1"><FileWarning size={14} className="text-red-500" /><span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Actividades no Entregadas</span></div>
                            {stats.missingActivities.length === 0 ? (
                              <div className="bg-green-100/50 p-4 rounded-2xl border border-green-200 text-green-700 text-xs font-bold">¡Alumno al corriente! No tiene pendientes registrados.</div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {stats.missingActivities.map(act => {
                                  const rName = course.rubric.items.find(ri => ri.id === act.rubricItemId)?.name || 'General';
                                  return (
                                    <div key={act.id} className="bg-white border border-red-100 p-3 rounded-xl flex items-center justify-between shadow-sm">
                                      <div className="flex flex-col"><span className="text-xs font-bold text-slate-700">{act.name}</span><span className="text-[8px] font-black text-red-400 uppercase tracking-tighter">{rName}</span></div>
                                      <AlertOctagon size={14} className="text-red-300" />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-3xl border border-indigo-100">
         <AlertCircle size={20} className="text-indigo-400 shrink-0" />
         <p className="text-[10px] font-bold text-indigo-700 leading-tight">
           {reportType === 'unsubmitted' ? "Nota: Se consideran pendientes las actividades sin nota capturada o marcadas con 0." : `Nota: Los rubros muestran puntos ganados según su peso. El estatus considera asistencia global de ${allAttendanceDates.length} clases.`}
         </p>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string, value: any, subText: string, icon: any, color: 'green' | 'red' | 'amber' | 'indigo' }> = ({ label, value, subText, icon: Icon, color }) => {
  const styles = { green: 'bg-green-50 border-green-100 text-green-600', red: 'bg-red-50 border-red-100 text-red-600', amber: 'bg-amber-50 border-amber-100 text-amber-600', indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600' };
  const iconStyles = { green: 'bg-green-600', red: 'bg-red-600', amber: 'bg-amber-600', indigo: 'bg-indigo-600' };
  return (
    <div className={`p-4 rounded-[2.2rem] border-2 ${styles[color]} shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
      <div className="absolute top-[-10px] right-[-10px] p-4 opacity-10 group-hover:scale-110 transition-transform"><Icon size={40} /></div>
      <span className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</span>
      <div className="flex items-baseline gap-1"><span className="text-2xl font-black">{value}</span><span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${iconStyles[color]} text-white`}>{subText}</span></div>
    </div>
  );
};
