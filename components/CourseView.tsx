
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
    { id: 'attendance', label: 'Asistencia', icon: Calendar },
    { id: 'activities', label: 'Actividades', icon: CheckSquare },
    { id: 'reports', label: 'Reportes', icon: FileText },
  ];

  const handleUpdateCourse = (updates: Partial<Course>) => {
    onUpdate({ ...course, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{course.name}</h1>
            <p className="text-indigo-600 font-semibold text-sm">Grupo: {course.groupName}</p>
          </div>
        </div>

        <nav className="flex overflow-x-auto pb-2 lg:pb-0 gap-1 lg:bg-white lg:p-1 lg:rounded-xl lg:shadow-sm lg:border lg:border-slate-200 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[500px]">
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
