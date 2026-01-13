
import React, { useState } from 'react';
import { Course, Student, StudentStatus, AttendanceRecord } from '../../types';
import { Download, Check, X, FileSpreadsheet, CalendarDays, TrendingUp, UserCheck, AlertCircle } from 'lucide-react';

interface ReportsModuleProps {
  course: Course;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ course }) => {
  const [reportType, setReportType] = useState<'attendance' | 'grades'>('attendance');
  // -1 representará "Todo el curso"
  const [filterMonth, setFilterMonth] = useState<number>(-1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const months = [
    { id: -1, name: 'Todo el Curso' },
    { id: 0, name: 'Enero' }, { id: 1, name: 'Febrero' }, { id: 2, name: 'Marzo' },
    { id: 3, name: 'Abril' }, { id: 4, name: 'Mayo' }, { id: 5, name: 'Junio' },
    { id: 6, name: 'Julio' }, { id: 7, name: 'Agosto' }, { id: 8, name: 'Septiembre' },
    { id: 9, name: 'Octubre' }, { id: 10, name: 'Noviembre' }, { id: 11, name: 'Diciembre' }
  ];

  const sortedStudents = [...course.students].sort((a, b) => a.name.localeCompare(b.name));

  /**
   * Obtiene estadísticas filtradas por el periodo seleccionado
   */
  const getStudentStats = (studentId: string, monthFilter: number) => {
    // 1. Filtrar registros de asistencia por periodo
    // Use explicit type string[] for allAttendanceDates to ensure type safety with Set and Array.from
    const allAttendanceDates: string[] = Array.from(new Set(course.attendance.map((a: AttendanceRecord) => a.date)));
    
    let filteredDates = allAttendanceDates;
    let studentRecords = course.attendance.filter((a: AttendanceRecord) => a.studentId === studentId);

    if (monthFilter !== -1) {
      // Fix: Add explicit type annotations to parameters to resolve the 'unknown' error in new Date()
      filteredDates = allAttendanceDates.filter((date: string) => new Date(date).getMonth() === monthFilter);
      studentRecords = studentRecords.filter((a: AttendanceRecord) => new Date(a.date).getMonth() === monthFilter);
    }

    const presentCount = studentRecords.filter(a => a.status === 'present').length;
    const absentCount = studentRecords.filter(a => a.status === 'absent').length;
    
    // El total de días posibles son los días únicos donde se pasó lista en ese periodo
    const totalPossible = filteredDates.length;
    const attendancePercentage = totalPossible > 0 ? (presentCount / totalPossible) * 100 : 0;

    // 2. Cálculo de Notas (Siempre global para el estatus final, pero útil tenerlo aquí)
    let totalScore = 0;
    const rubricScores: { [key: string]: number } = {};

    course.rubric.items.forEach(rubricItem => {
      const activitiesOfRubric = course.activities.filter(a => a.rubricItemId === rubricItem.id);
      if (activitiesOfRubric.length === 0) {
        rubricScores[rubricItem.id] = 0;
        return;
      }
      let rubricPoints = 0;
      activitiesOfRubric.forEach(act => {
        const grade = course.grades.find(g => g.activityId === act.id && g.studentId === studentId)?.value || 0;
        if (act.gradingType === 'POINTS' && act.maxPoints) rubricPoints += (grade / act.maxPoints) * 100;
        else rubricPoints += grade;
      });
      const avgRubricScore = rubricPoints / activitiesOfRubric.length;
      rubricScores[rubricItem.id] = avgRubricScore;
      totalScore += (avgRubricScore * rubricItem.percentage) / 100;
    });

    // Estatus final (Considera asistencia global siempre para rigor académico)
    const globalStudentRecords = course.attendance.filter(a => a.studentId === studentId);
    const globalTotalPossible = allAttendanceDates.length;
    const globalAttendancePct = globalTotalPossible > 0 ? (globalStudentRecords.filter(a => a.status === 'present').length / globalTotalPossible) * 100 : 0;

    let status: StudentStatus = 'Aprobado';
    if (globalAttendancePct < course.rubric.minAttendance) status = 'Sin Derecho';
    else if (totalScore < course.rubric.minGrade) status = 'Reprobado';

    return { 
      presentCount, 
      absentCount, 
      attendancePercentage, 
      totalScore, 
      rubricScores, 
      status,
      globalAttendancePct 
    };
  };

  const groupStats = () => {
    const stats = sortedStudents.map(s => getStudentStats(s.id, -1)); // Stats globales para el dashboard
    const total = stats.length;
    if (total === 0) return null;
    const approved = stats.filter(s => s.status === 'Aprobado').length;
    const failed = stats.filter(s => s.status === 'Reprobado').length;
    const noRight = stats.filter(s => s.status === 'Sin Derecho').length;
    const avgAttendance = stats.reduce((sum, s) => sum + s.attendancePercentage, 0) / total;
    return { approved, approvedPct: (approved / total) * 100, failed, failedPct: (failed / total) * 100, noRight, noRightPct: (noRight / total) * 100, avgAttendance };
  };

  const gStats = groupStats();

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const periodLabel = filterMonth === -1 ? "Total" : months.find(m => m.id === filterMonth)?.name;
    
    if (reportType === 'attendance') {
      csvContent += `Reporte de Asistencia - Periodo: ${periodLabel}\n`;
      csvContent += "Alumno,Asistencias,Faltas,% Asistencia en Periodo\n";
      sortedStudents.forEach(s => {
        const stats = getStudentStats(s.id, filterMonth);
        csvContent += `${s.name},${stats.presentCount},${stats.absentCount},${stats.attendancePercentage.toFixed(1)}%\n`;
      });
    } else {
      csvContent += "Reporte de Notas Finales\n";
      const rubricHeaders = course.rubric.items.map(i => `${i.name} (${i.percentage}%)`).join(",");
      csvContent += `Alumno,${rubricHeaders},Nota Final,Asistencia Global %,Estatus\n`;
      sortedStudents.forEach(s => {
        const stats = getStudentStats(s.id, -1);
        const rubScores = course.rubric.items.map(i => (stats.rubricScores[i.id] || 0).toFixed(1)).join(",");
        csvContent += `${s.name},${rubScores},${stats.totalScore.toFixed(1)},${stats.globalAttendancePct.toFixed(1)}%,${stats.status}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EduPro_${course.groupName}_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex bg-slate-100 p-1.5 rounded-[1.25rem] shadow-inner w-full md:w-auto">
          <button 
            onClick={() => setReportType('attendance')}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              reportType === 'attendance' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500'
            }`}
          >
            Asistencia
          </button>
          <button 
            onClick={() => setReportType('grades')}
            className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              reportType === 'grades' ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500'
            }`}
          >
            Notas
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {reportType === 'attendance' && (
            <div className="relative flex-1 md:flex-none">
              <select 
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-5 py-2.5 pr-10 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all" 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              >
                {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <CalendarDays size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}
          <button 
            onClick={exportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-100 active:scale-95 transition-all"
          >
            <FileSpreadsheet size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {reportType === 'grades' && gStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Aprobados" value={gStats.approved} percentage={gStats.approvedPct} color="green" icon={<UserCheck size={18}/>} />
          <StatCard label="Reprobados" value={gStats.failed} percentage={gStats.failedPct} color="red" icon={<AlertCircle size={18}/>} />
          <StatCard label="Sin Derecho" value={gStats.noRight} percentage={gStats.noRightPct} color="amber" icon={<X size={18}/>} />
          <StatCard label="Asistencia Grupal" value={`${gStats.avgAttendance.toFixed(1)}%`} color="indigo" icon={<TrendingUp size={18}/>} />
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl shadow-indigo-50/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              {reportType === 'attendance' ? (
                <tr>
                  <th className="px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px]">Alumno</th>
                  <th className="px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px]">Asistencias</th>
                  <th className="px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px]">Faltas</th>
                  <th className="px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px]">
                    {filterMonth === -1 ? '% Global' : '% del Mes'}
                  </th>
                  <th className="px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px]">Auditoría Visual</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px]">Alumno</th>
                  {course.rubric.items.map(item => <th key={item.id} className="px-6 py-5 text-center font-black text-indigo-400 uppercase tracking-[0.15em] text-[9px]">{item.name}</th>)}
                  <th className="px-6 py-5 text-center font-black text-slate-700 uppercase tracking-widest bg-slate-100/50 text-[9px]">Final</th>
                  <th className="px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px]">Asis. %</th>
                  <th className="px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px]">Estatus</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map(student => {
                const stats = getStudentStats(student.id, filterMonth);
                
                // Para el historial visual, filtramos según la selección
                const historyRecords = course.attendance.filter((a: AttendanceRecord) => {
                  if (a.studentId !== student.id) return false;
                  if (filterMonth === -1) return true;
                  // Explicitly use new Date() with the string date, ensuring it is treated as a string
                  return new Date(a.date).getMonth() === filterMonth;
                }).sort((a: AttendanceRecord, b: AttendanceRecord) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return (
                  <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{student.name}</span>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">ID: {student.id.substr(0,5)}</span>
                       </div>
                    </td>
                    {reportType === 'attendance' ? (
                      <>
                        <td className="px-6 py-5 text-center text-green-600 font-black text-base">{stats.presentCount}</td>
                        <td className="px-6 py-5 text-center text-red-600 font-black text-base">{stats.absentCount}</td>
                        <td className="px-6 py-5 text-center">
                           <div className={`inline-flex items-center px-3 py-1.5 rounded-xl font-black text-sm border-2 ${
                              stats.attendancePercentage >= course.rubric.minAttendance ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                           }`}>
                             {stats.attendancePercentage.toFixed(0)}%
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-1.5 flex-wrap max-w-[150px]">
                            {historyRecords.slice(0, 15).map((rec, i) => (
                              <div 
                                key={i} 
                                title={rec.date}
                                className={`w-3.5 h-3.5 rounded-md flex items-center justify-center shadow-sm ${rec.status === 'present' ? 'bg-green-400' : 'bg-red-400'}`}
                              >
                                {rec.status === 'present' ? <Check size={8} className="text-white" strokeWidth={5}/> : <X size={8} className="text-white" strokeWidth={5}/>}
                              </div>
                            ))}
                            {historyRecords.length > 15 && <span className="text-[9px] font-black text-slate-300">...</span>}
                            {historyRecords.length === 0 && <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Sin registros</span>}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {course.rubric.items.map(item => <td key={item.id} className="px-6 py-5 text-center font-black text-slate-600">{(stats.rubricScores[item.id] || 0).toFixed(0)}</td>)}
                        <td className="px-6 py-5 text-center font-black text-slate-900 bg-slate-50 text-base">{stats.totalScore.toFixed(1)}</td>
                        <td className="px-6 py-5 text-center font-bold text-slate-400">{stats.globalAttendancePct.toFixed(0)}%</td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${
                            stats.status === 'Aprobado' ? 'bg-green-50 text-green-700 border-green-100' : 
                            stats.status === 'Reprobado' ? 'bg-red-50 text-red-700 border-red-100' : 
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {stats.status}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: any, percentage?: number, color: string, icon?: React.ReactNode }> = ({ label, value, percentage, color, icon }) => {
  const colorMap: { [key: string]: string } = {
    green: 'border-green-400 bg-white text-green-700 shadow-green-100/50',
    red: 'border-red-400 bg-white text-red-700 shadow-red-100/50',
    amber: 'border-amber-400 bg-white text-amber-700 shadow-amber-100/50',
    indigo: 'border-indigo-400 bg-white text-indigo-700 shadow-indigo-100/50'
  };
  const iconColorMap: { [key: string]: string } = {
    green: 'bg-green-50 text-green-500',
    red: 'bg-red-50 text-red-500',
    amber: 'bg-amber-50 text-amber-500',
    indigo: 'bg-indigo-50 text-indigo-500'
  };

  return (
    <div className={`p-6 rounded-[2rem] border border-slate-100 shadow-xl transition-all hover:scale-[1.02] ${colorMap[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconColorMap[color]}`}>
          {icon}
        </div>
        {percentage !== undefined && (
          <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-100">
            {percentage.toFixed(0)}% DEL GRUPO
          </span>
        )}
      </div>
      <p className="text-[10px] uppercase font-black opacity-60 mb-1 tracking-widest">{label}</p>
      <span className="text-3xl font-black tracking-tight">{value}</span>
    </div>
  );
};
