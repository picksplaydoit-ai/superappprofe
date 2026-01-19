
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
  ];

  const allAttendanceDates = useMemo(() => {
    return Array.from(new Set(course.attendance.map((a: AttendanceRecord) => a.date))).sort();
  }, [course.attendance]);

  const filteredDates = useMemo(() => {
    if (activeFilter === '-1') return allAttendanceDates;
    let targetMonths: number[] = [];
    if (activeFilter === 'Q1') targetMonths = [0, 1, 2];
    else if (activeFilter === 'Q2') targetMonths = [3, 4, 5];
    else if (activeFilter === 'Q3') targetMonths = [6, 7, 8];
    else if (activeFilter === 'Q4') targetMonths = [9, 10, 11];
    
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
        const gradeRecord = course.grades.find(g => g.activityId === act.id && g.studentId === studentId);
        const grade = gradeRecord ? gradeRecord.value : 0;
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

    return { presentInPeriod, absentInPeriod: periodPossible - presentInPeriod, periodPct, finalGrade, weightedRubricScores, status, globalPct, periodPossible, missingActivities };
  };

  const sortedStudents = useMemo(() => [...course.students].sort((a, b) => a.name.localeCompare(b.name)), [course.students]);

  const exportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        let csv = "\uFEFF"; // BOM para Excel
        if (reportType === 'attendance') {
          csv += `Nombre,Asistencias,Faltas,%\n`;
          sortedStudents.forEach(s => {
            const stats = getStudentStats(s.id);
            csv += `"${s.name}",${stats.presentInPeriod},${stats.absentInPeriod},${stats.periodPct.toFixed(1)}%\n`;
          });
        } else if (reportType === 'grades') {
          csv += `Nombre,Nota Final,Asistencia %,Estatus\n`;
          sortedStudents.forEach(s => {
            const stats = getStudentStats(s.id);
            csv += `"${s.name}",${stats.finalGrade.toFixed(1)},${stats.globalPct.toFixed(1)}%,"${stats.status}"\n`;
          });
        } else {
          csv += `Nombre,Pendientes\n`;
          sortedStudents.forEach(s => {
            const stats = getStudentStats(s.id);
            csv += `"${s.name}",${stats.missingActivities.length}\n`;
          });
        }
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `EduPro_${course.groupName}_${reportType}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
      } finally { setIsExporting(false); }
    }, 500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button onClick={() => setReportType('attendance')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${reportType === 'attendance' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Asistencia</button>
        <button onClick={() => setReportType('grades')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${reportType === 'grades' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Notas</button>
        <button onClick={() => setReportType('unsubmitted')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${reportType === 'unsubmitted' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}>Pendientes</button>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={exportCSV} 
          disabled={isExporting || sortedStudents.length === 0} 
          className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />} 
          Descargar CSV
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Alumno</th>
                <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Dato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map(student => {
                const stats = getStudentStats(student.id);
                return (
                  <tr key={student.id}>
                    <td className="px-5 py-4 text-xs font-bold text-slate-700">{student.name}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-black text-[10px]">
                        {reportType === 'attendance' ? `${stats.periodPct.toFixed(0)}%` : reportType === 'grades' ? stats.finalGrade.toFixed(1) : stats.missingActivities.length}
                      </span>
                    </td>
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
