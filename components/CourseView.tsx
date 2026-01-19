
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

  const handleUpdateCourse = (updates: Partial<Course>) => {
    onUpdate({ ...course, ...updates });
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center gap-4 px-2 py-2">
        <button 
          onClick={onBack}
          className="p-3 bg-white shadow-sm border border-slate-200 rounded-2xl transition-colors text-slate-600 active-scale"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 leading-none">{course.name}</h1>
          <p className="text-indigo-600 font-bold text-[10px] mt-1 uppercase tracking-[0.2em]">Grupo: {course.groupName}</p>
        </div>
      </div>

      <nav className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl transition-all duration-200 active-scale border ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100 tab-active'
                  : 'bg-white border-slate-100 text-slate-500 shadow-sm'
              }`}
            >
              <div className={`${isActive ? 'text-white' : 'text-indigo-500'}`}>
                <tab.icon size={18} strokeWidth={isActive ? 3 : 2} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-tighter text-center leading-none ${isActive ? 'text-white' : 'text-slate-600'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 min-h-[500px] overflow-hidden">
        {activeTab === 'students' && (
          <StudentsModule course={course} onUpdate={handleUpdateCourse} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceModule course={course} onUpdate={handleUpdateCourse} />
        )}
        {activeTab === 'rubric' && (
          <RubricModule course={course} onUpdate={handleUpdateCourse} />
        )}
        {activeTab === 'activities' && (
          <ActivitiesModule course={course} onUpdate={handleUpdateCourse} />
        )}
        {activeTab === 'reports' && (
          <ReportsModule course={course} />
        )}
        {activeTab === 'groups' && (
          <GroupsModule course={course} onUpdate={handleUpdateCourse} />
        )}
      </div>
    </div>
  );
};
