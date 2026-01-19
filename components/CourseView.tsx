import React, { useState } from 'react';
import { Course } from '../types';
import { 
  ChevronLeft, 
  CheckSquare, 
  Settings, 
  FileText, 
  Users, 
  Calendar,
  UsersRound
} from 'lucide-react';
import { AttendanceModule } from './modules/AttendanceModule';
import { RubricModule } from './modules/RubricModule';
import { ActivitiesModule } from './modules/ActivitiesModule';
import { ReportsModule } from './modules/ReportsModule';
import { GroupsModule } from './modules/GroupsModule';
import { StudentsModule } from './modules/StudentsModule';

interface CourseViewProps {
  course: Course;
  onUpdate: (course: Course) => void;
  onBack: () => void;
}

type Tab = 'students' | 'rubric' | 'groups' | 'attendance' | 'activities' | 'reports';

export const CourseView: React.FC<CourseViewProps> = ({ course, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('students');

  const tabs = [
    { id: 'students', label: 'Alumnos', icon: Users },
    { id: 'rubric', label: 'Rúbrica', icon: Settings },
    { id: 'groups', label: 'Equipos', icon: UsersRound },
    { id: 'attendance', label: 'Asist.', icon: Calendar },
    { id: 'activities', label: 'Notas', icon: CheckSquare },
    { id: 'reports', label: 'Reportes', icon: FileText },
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-5 bg-white shadow-md border border-slate-200 rounded-[2rem] text-[#020617] active:scale-90">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-[#020617] leading-tight">{course.name}</h1>
          <p className="text-[#4f46e5] font-black text-[11px] uppercase tracking-[0.2em] mt-1">Grupo: {course.groupName}</p>
        </div>
      </div>

      <nav className="flex overflow-x-auto gap-4 pb-4 px-1 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-none flex items-center gap-3 px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all shadow-sm ${
                isActive 
                  ? 'bg-[#4f46e5] text-white shadow-[#4f46e5]/20 scale-105'
                  : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="card-android min-h-[600px] border-none shadow-xl">
        {activeTab === 'students' && <StudentsModule course={course} onUpdate={(u) => onUpdate({...course, ...u})} />}
        {activeTab === 'attendance' && <AttendanceModule course={course} onUpdate={(u) => onUpdate({...course, ...u})} />}
        {activeTab === 'rubric' && <RubricModule course={course} onUpdate={(u) => onUpdate({...course, ...u})} />}
        {activeTab === 'activities' && <ActivitiesModule course={course} onUpdate={(u) => onUpdate({...course, ...u})} />}
        {activeTab === 'reports' && <ReportsModule course={course} />}
        {activeTab === 'groups' && <GroupsModule course={course} onUpdate={(u) => onUpdate({...course, ...u})} />}
      </div>
    </div>
  );
};