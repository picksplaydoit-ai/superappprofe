
import React, { useState } from 'react';
import { Course, Student, StudentStatus, AttendanceRecord } from '../../types';
import { Download, Check, X, FileSpreadsheet, CalendarDays, TrendingUp, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

interface ReportsModuleProps {
  course: Course;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ course }) => {
  const [reportType, setReportType] = useState<'attendance' | 'grades'>('attendance');
  const [activeFilter, setActiveFilter] = useState<string>('-1');
  const [isExporting, setIsExporting] = useState(false);

  const filterOptions = [
    { id: '-1', name: 'Todo el Curso', group: 'General' },
    { id: 'Q1', name: '1er Trimestre (Ene-Mar)', group: 'Trimestres' },
    { id: 'Q2', name: '2do Trimestre (Abr-Jun)', group: 'Trimestres' },
    { id: 'Q3', name: '3er Trimestre (Jul-Sep)', group: 'Trimestres' },
    { id: 'Q4', name: '4to Trimestre (Oct-Dic)', group: 'Trimestres' },
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

  const sortedStudents = [...course.students].sort((a, b) => a.name.localeCompare(b.name));

  const getStudentStats = (studentId: string, filterId: string) => {
    const allAttendanceDates: string[] = Array.from(new Set(course.attendance.map((a: AttendanceRecord) => a.date)));
    
    let filteredDates = allAttendanceDates;
    let studentRecords = course.attendance.filter((a: AttendanceRecord) => a.studentId === studentId);

    // Lógica de filtrado avanzada
    if (filterId !== '-1') {
      let targetMonths: number[] = [];
      
      if (filterId.startsWith('Q')) {
        if (filterId === 'Q1') targetMonths = [0, 1, 2];
        else if (filterId === 'Q2') targetMonths = [3, 4, 5];
        else if (filterId === 'Q3') targetMonths = [6, 7, 8];
        else if (filterId === 'Q4') targetMonths = [9, 10, 11];
      } else {
        targetMonths = [parseInt(filterId)];
      }

      filteredDates = allAttendanceDates.filter((date: string) => targetMonths.includes(new Date(date).getUTCMonth()));
      studentRecords = studentRecords.filter((a: AttendanceRecord) => targetMonths.includes(new Date(a.date).getUTCMonth()));
    }

    const presentCount = studentRecords.filter(a => a.status === 'present').length;
    const absentCount = studentRecords.filter(a => a.status === 'absent').length;
    const totalPossible = filteredDates.length;
    const attendancePercentage = totalPossible > 0 ? (presentCount / totalPossible) * 100 : 0;

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

    const globalStudentRecords = course.attendance.filter(a => a.studentId === studentId);
    const globalTotalPossible = allAttendanceDates.length;
    const globalAttendancePct = globalTotalPossible > 0 ? (globalStudentRecords.filter(a => a.status === 'present').length / globalTotalPossible) * 100 : 0;

    let status: StudentStatus = 'Aprobado';
    if (globalAttendancePct < course.rubric.minAttendance) status = 'Sin Derecho';
    else if (totalScore < course.rubric.minGrade) status = 'Reprobado';

    return { presentCount, absentCount, attendancePercentage, totalScore, rubricScores, status, globalAttendancePct };
  };

  const gStats = (() => {
    const stats = sortedStudents.map(s => getStudentStats(s.id, '-1'));
    const total = stats.length;
    if (total === 0) return null;
    const approved = stats.filter(s => s.status === 'Aprobado').length;
    const failed = stats.filter(s => s.status === 'Reprobado').length;
    const noRight = stats.filter(s => s.status === 'Sin Derecho').length;
    const avgAttendance = stats.reduce((sum, s) => sum + s.attendancePercentage, 0) / total;
    return { 
      approved, approvedPct: (approved / total) * 100, 
      failed, failedPct: (failed / total) * 100, 
      noRight, noRightPct: (noRight / total) * 100, 
      avgAttendance 
    };
  })();

  const exportCSV = () => {
    setIsExporting(true);
    try {
      let csvRows = [];
      const periodLabel = filterOptions.find(f => f.id === activeFilter)?.name || "Total";
      if (reportType === 'attendance') {
        csvRows.push(`Reporte de Asistencia - Periodo: ${periodLabel}`);
        csvRows.push("Alumno,Asistencias,Faltas,% Asistencia en Periodo");
        sortedStudents.forEach(s => {
          const stats = getStudentStats(s.id, activeFilter);
          csvRows.push(`${s.name},${stats.presentCount},${stats.absentCount},${stats.attendancePercentage.toFixed(1)}%`);
        });
      } else {
        csvRows.push("Reporte de Notas Finales");
        const rubricHeaders = course.rubric.items.map(i => `${i.name} (${i.percentage}%)`).join(",");
        csvRows.push(`Alumno,${rubricHeaders},Nota Final,Asistencia Global %,Estatus`);
        sortedStudents.forEach(s => {
          const stats = getStudentStats(s.id, '-1');
          const rubScores = course.rubric.items.map(i => (stats.rubricScores[i.id] || 0).toFixed(1)).join(",");
          csvRows.push(`${s.name},${rubScores},${stats.totalScore.toFixed(1)},${stats.globalAttendancePct.toFixed(1)}%,${stats.status}`);
        });
      }
      const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `EduPro_${course.groupName}_${reportType}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    finally { setTimeout(() => setIsExporting(false), 1000); }
  };

  return (
    <div className="p-3 sm:p-5">
      {/* Controles Compactos */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setReportType('attendance')}
            className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
              reportType === 'attendance' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
            }`}
          >
            Asistencia
          </button>
          <button 
            onClick={() => setReportType('grades')}
            className={`flex-1 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
              reportType === 'grades' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
            }`}
          >
            Notas Finales
          </button>
        </div>

        <div className="flex gap-2">
          {reportType === 'attendance' && (
            <select 
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none shadow-sm focus:ring-2 focus:ring-indigo-100" 
              value={activeFilter} 
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <optgroup label="General">
                <option value="-1">Todo el Curso</option>
              </optgroup>
              <optgroup label="Trimestres">
                <option value="Q1">1er Trimestre (Ene-Mar)</option>
                <option value="Q2">2do Trimestre (Abr-Jun)</option>
                <option value="Q3">3er Trimestre (Jul-Sep)</option>
                <option value="Q4">4to Trimestre (Oct-Dic)</option>
              </optgroup>
              <optgroup label="Meses">
                {filterOptions.filter(f => f.group === 'Meses').map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
            </select>
          )}
          <button 
            onClick={exportCSV}
            disabled={isExporting || sortedStudents.length === 0}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
              isExporting ? 'bg-slate-400 text-white' : 'bg-green-600 text-white shadow-lg active:scale-95'
            }`}
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            CSV
          </button>
        </div>
      </div>

      {/* Mini Estadísticas con Porcentajes */}
      {reportType === 'grades' && gStats && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <MiniStat label="Aprobados" value={gStats.approved} percentage={gStats.approvedPct} color="green" />
          <MiniStat label="Reprobados" value={gStats.failed} percentage={gStats.failedPct} color="red" />
          <MiniStat label="Sin Derecho" value={gStats.noRight} percentage={gStats.noRightPct} color="amber" />
          <MiniStat label="Grup. Asist" value={`${gStats.avgAttendance.toFixed(0)}%`} color="indigo" />
        </div>
      )}

      {/* Tabla Compacta con Desglose por Rubro */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              {reportType === 'attendance' ? (
                <tr>
                  <th className="px-3 py-3 text-left font-black text-slate-400 uppercase text-[9px] sticky left-0 bg-slate-50">Alumno</th>
                  <th className="px-2 py-3 text-center font-black text-slate-400 uppercase text-[9px]">Asist</th>
                  <th className="px-2 py-3 text-center font-black text-slate-400 uppercase text-[9px]">Faltas</th>
                  <th className="px-2 py-3 text-center font-black text-slate-400 uppercase text-[9px]">%</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-3 py-3 text-left font-black text-slate-400 uppercase text-[9px] min-w-[100px] sticky left-0 bg-slate-50">Alumno</th>
                  {course.rubric.items.map(item => (
                    <th key={item.id} className="px-2 py-3 text-center font-black text-slate-400 uppercase text-[8px] min-w-[45px]">
                      {item.name.substring(0, 4)}.
                    </th>
                  ))}
                  <th className="px-2 py-3 text-center font-black text-slate-700 uppercase text-[9px] bg-indigo-50/50">Nota</th>
                  <th className="px-2 py-3 text-center font-black text-slate-400 uppercase text-[9px]">ST</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map(student => {
                const stats = getStudentStats(student.id, reportType === 'attendance' ? activeFilter : '-1');
                return (
                  <tr key={student.id} className="active:bg-indigo-50/50 transition-colors">
                    <td className="px-3 py-2.5 sticky left-0 bg-white z-10 border-r border-slate-50">
                       <span className="font-bold text-slate-700 text-[10px] block truncate max-w-[100px]">{student.name}</span>
                    </td>
                    {reportType === 'attendance' ? (
                      <>
                        <td className="px-2 py-2.5 text-center text-green-600 font-black">{stats.presentCount}</td>
                        <td className="px-2 py-2.5 text-center text-red-600 font-black">{stats.absentCount}</td>
                        <td className="px-2 py-2.5 text-center">
                           <span className={`text-[10px] font-black ${stats.attendancePercentage >= course.rubric.minAttendance ? 'text-green-600' : 'text-red-600'}`}>
                             {stats.attendancePercentage.toFixed(0)}%
                           </span>
                        </td>
                      </>
                    ) : (
                      <>
                        {course.rubric.items.map(item => (
                          <td key={item.id} className="px-2 py-2.5 text-center text-[10px] text-slate-400 font-medium">
                            {(stats.rubricScores[item.id] || 0).toFixed(0)}
                          </td>
                        ))}
                        <td className="px-2 py-2.5 text-center font-black text-slate-900 bg-indigo-50/30 text-[12px]">{stats.totalScore.toFixed(1)}</td>
                        <td className="px-2 py-2.5 text-center">
                          <div className={`w-1.5 h-1.5 rounded-full mx-auto ${
                            stats.status === 'Aprobado' ? 'bg-green-500' : 
                            stats.status === 'Reprobado' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
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

const MiniStat: React.FC<{ label: string, value: any, percentage?: number, color: string }> = ({ label, value, percentage, color }) => {
  const colors: any = {
    green: 'text-green-600 border-green-100 bg-green-50/30',
    red: 'text-red-600 border-red-100 bg-red-50/30',
    amber: 'text-amber-600 border-amber-100 bg-amber-50/30',
    indigo: 'text-indigo-600 border-indigo-100 bg-indigo-50/30'
  };
  const badgeColors: any = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    indigo: 'bg-indigo-100 text-indigo-700'
  };

  return (
    <div className={`px-3 py-2 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden ${colors[color]}`}>
      <span className="text-[7px] font-black uppercase opacity-60 tracking-widest mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-black leading-none">{value}</span>
        {percentage !== undefined && (
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${badgeColors[color]}`}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
};
