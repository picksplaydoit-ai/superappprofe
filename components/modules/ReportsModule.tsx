
import React, { useState } from 'react';
import { Course, Student, StudentStatus } from '../../types';
import { Download, Check, X, FileSpreadsheet } from 'lucide-react';

interface ReportsModuleProps {
  course: Course;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ course }) => {
  const [reportType, setReportType] = useState<'attendance' | 'grades'>('attendance');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const sortedStudents = [...course.students].sort((a, b) => a.name.localeCompare(b.name));

  const getStudentStats = (studentId: string) => {
    const studentRecords = course.attendance.filter(a => a.studentId === studentId);
    const presentCount = studentRecords.filter(a => a.status === 'present').length;
    const absentCount = studentRecords.filter(a => a.status === 'absent').length;
    const totalPossible = Array.from(new Set(course.attendance.map(a => a.date))).length;
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

    let status: StudentStatus = 'Aprobado';
    if (attendancePercentage < course.rubric.minAttendance) status = 'Sin Derecho';
    else if (totalScore < course.rubric.minGrade) status = 'Reprobado';

    return { presentCount, absentCount, attendancePercentage, totalScore, rubricScores, status };
  };

  const groupStats = () => {
    const stats = sortedStudents.map(s => getStudentStats(s.id));
    const total = stats.length;
    if (total === 0) return null;
    const approved = stats.filter(s => s.status === 'Aprobado').length;
    const failed = stats.filter(s => s.status === 'Reprobado').length;
    const noRight = stats.filter(s => s.status === 'Sin Derecho').length;
    const avgAttendance = stats.reduce((sum, s) => sum + s.attendancePercentage, 0) / total;
    return { approved, approvedPct: (approved / total) * 100, failed, failedPct: (failed / total) * 100, noRight, noRightPct: (noRight / total) * 100, avgAttendance };
  };

  const gStats = groupStats();

  // Export Logic
  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'attendance') {
      csvContent += "Alumno,Asistencias,Faltas,% Asistencia Total\n";
      sortedStudents.forEach(s => {
        const stats = getStudentStats(s.id);
        csvContent += `${s.name},${stats.presentCount},${stats.absentCount},${stats.attendancePercentage.toFixed(1)}%\n`;
      });
    } else {
      const rubricHeaders = course.rubric.items.map(i => `${i.name} (${i.percentage}%)`).join(",");
      csvContent += `Alumno,${rubricHeaders},Nota Final,Asistencia %,Estatus\n`;
      sortedStudents.forEach(s => {
        const stats = getStudentStats(s.id);
        const rubScores = course.rubric.items.map(i => (stats.rubricScores[i.id] || 0).toFixed(1)).join(",");
        csvContent += `${s.name},${rubScores},${stats.totalScore.toFixed(1)},${stats.attendancePercentage.toFixed(1)}%,${stats.status}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_${reportType}_${course.groupName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
          <button 
            onClick={() => setReportType('attendance')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              reportType === 'attendance' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-indigo-400'
            }`}
          >
            Asistencia
          </button>
          <button 
            onClick={() => setReportType('grades')}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              reportType === 'grades' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-indigo-400'
            }`}
          >
            Notas
          </button>
        </div>

        <div className="flex items-center gap-2">
          {reportType === 'attendance' && (
            <div className="flex gap-1">
              <select className="px-3 py-1.5 border border-slate-200 rounded-xl text-[11px] font-bold outline-none shadow-sm" value={filterMonth} onChange={(e) => setFilterMonth(parseInt(e.target.value))}>
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
          )}
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white text-green-600 border border-green-200 hover:bg-green-50 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {reportType === 'grades' && gStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Aprobados" value={gStats.approved} percentage={gStats.approvedPct} color="green" />
          <StatCard label="Reprobados" value={gStats.failed} percentage={gStats.failedPct} color="red" />
          <StatCard label="Sin Derecho" value={gStats.noRight} percentage={gStats.noRightPct} color="amber" />
          <StatCard label="Asistencia Grupal" value={`${gStats.avgAttendance.toFixed(1)}%`} color="indigo" />
        </div>
      )}

      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              {reportType === 'attendance' ? (
                <tr>
                  <th className="px-5 py-4 text-left font-black text-slate-400 uppercase tracking-widest">Alumno</th>
                  <th className="px-5 py-4 text-center font-black text-slate-400 uppercase tracking-widest">Asistencias</th>
                  <th className="px-5 py-4 text-center font-black text-slate-400 uppercase tracking-widest">Faltas</th>
                  <th className="px-5 py-4 text-center font-black text-slate-400 uppercase tracking-widest">% Total</th>
                  <th className="px-5 py-4 text-left font-black text-slate-400 uppercase tracking-widest">Historial Mes</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-5 py-4 text-left font-black text-slate-400 uppercase tracking-widest">Alumno</th>
                  {course.rubric.items.map(item => <th key={item.id} className="px-5 py-4 text-center font-black text-indigo-400 uppercase tracking-widest">{item.name}</th>)}
                  <th className="px-5 py-4 text-center font-black text-slate-700 uppercase tracking-widest bg-slate-100/50">Nota</th>
                  <th className="px-5 py-4 text-center font-black text-slate-400 uppercase tracking-widest">Asis.</th>
                  <th className="px-5 py-4 text-center font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map(student => {
                const stats = getStudentStats(student.id);
                const monthlyRecords = course.attendance.filter(a => {
                  const d = new Date(a.date);
                  return a.studentId === student.id && d.getMonth() === filterMonth && d.getFullYear() === filterYear;
                });

                return (
                  <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-700">{student.name}</td>
                    {reportType === 'attendance' ? (
                      <>
                        <td className="px-5 py-4 text-center text-green-600 font-black">{stats.presentCount}</td>
                        <td className="px-5 py-4 text-center text-red-600 font-black">{stats.absentCount}</td>
                        <td className="px-5 py-4 text-center font-black text-indigo-600 bg-indigo-50/30">{stats.attendancePercentage.toFixed(0)}%</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1 flex-wrap">
                            {monthlyRecords.map((rec, i) => (
                              <div key={i} className={`w-3.5 h-3.5 rounded-md flex items-center justify-center ${rec.status === 'present' ? 'bg-green-400' : 'bg-red-400'}`}>
                                {rec.status === 'present' ? <Check size={8} className="text-white" strokeWidth={5}/> : <X size={8} className="text-white" strokeWidth={5}/>}
                              </div>
                            ))}
                            {monthlyRecords.length === 0 && <span className="text-[10px] text-slate-300 font-medium">Sin datos</span>}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {course.rubric.items.map(item => <td key={item.id} className="px-5 py-4 text-center font-medium text-slate-600">{(stats.rubricScores[item.id] || 0).toFixed(0)}</td>)}
                        <td className="px-5 py-4 text-center font-black text-slate-900 bg-slate-50">{stats.totalScore.toFixed(1)}</td>
                        <td className="px-5 py-4 text-center font-bold text-slate-400">{stats.attendancePercentage.toFixed(0)}%</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                            stats.status === 'Aprobado' ? 'bg-green-100 text-green-700' : stats.status === 'Reprobado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
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

const StatCard: React.FC<{ label: string, value: any, percentage?: number, color: string }> = ({ label, value, percentage, color }) => {
  const colorMap: { [key: string]: string } = {
    green: 'border-green-400 bg-green-50 text-green-700',
    red: 'border-red-400 bg-red-50 text-red-700',
    amber: 'border-amber-400 bg-amber-50 text-amber-700',
    indigo: 'border-indigo-400 bg-indigo-50 text-indigo-700'
  };
  return (
    <div className={`p-5 rounded-2xl border-l-4 shadow-sm ${colorMap[color]}`}>
      <p className="text-[10px] uppercase font-black opacity-60 mb-1 tracking-widest">{label}</p>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-black">{value}</span>
        {percentage !== undefined && <span className="text-xs font-black opacity-60">{percentage.toFixed(0)}%</span>}
      </div>
    </div>
  );
};
