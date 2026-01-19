
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { CourseView } from './components/CourseView';
import { Layout } from './components/Layout';
import { Course } from './types';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [professorName, setProfessorName] = useState<string>('');

  useEffect(() => {
    const savedCourses = localStorage.getItem('edupro_courses');
    const savedProf = localStorage.getItem('edupro_prof_name');
    
    if (savedCourses) {
      try {
        setCourses(JSON.parse(savedCourses));
      } catch (e) {
        console.error("Error loading courses", e);
        setCourses([]);
      }
    }
    if (savedProf) setProfessorName(savedProf);
  }, []);

  useEffect(() => {
    localStorage.setItem('edupro_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('edupro_prof_name', professorName);
  }, [professorName]);

  const addCourse = (name: string, groupName: string) => {
    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      groupName,
      students: [],
      attendance: [],
      rubric: {
        minAttendance: 80,
        minGrade: 60,
        items: []
      },
      activities: [],
      grades: []
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const updateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    if (selectedCourseId === id) setSelectedCourseId(null);
  };

  const exportBackup = () => {
    const backupData = {
      courses,
      professorName,
      version: "1.2",
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `EduPro_Respaldo_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const importBackup = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
        if (data.professorName) setProfessorName(data.professorName);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Import error", e);
      return false;
    }
  };

  const currentCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <Layout 
      professorName={professorName} 
      onProfessorNameChange={setProfessorName}
      onHome={() => setSelectedCourseId(null)}
    >
      {currentCourse ? (
        <CourseView 
          course={currentCourse} 
          onUpdate={updateCourse} 
          onBack={() => setSelectedCourseId(null)} 
        />
      ) : (
        <Dashboard 
          courses={courses} 
          onAddCourse={addCourse} 
          onUpdateCourse={updateCourse}
          onDeleteCourse={deleteCourse}
          onSelectCourse={setSelectedCourseId}
          onExportBackup={exportBackup}
          onImportBackup={importBackup}
        />
      )}
    </Layout>
  );
};

export default App;
