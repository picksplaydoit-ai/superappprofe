
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { CourseView } from './components/CourseView';
import { Layout } from './components/Layout';
import { User, Course } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Carga inicial
  useEffect(() => {
    const savedUser = localStorage.getItem('edupro_user');
    const savedCourses = localStorage.getItem('edupro_courses');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedCourses) {
      try {
        setCourses(JSON.parse(savedCourses));
      } catch (e) {
        console.error("Error cargando cursos", e);
        setCourses([]);
      }
    }
  }, []);

  // Persistencia automática
  useEffect(() => {
    if (courses.length >= 0) {
      localStorage.setItem('edupro_courses', JSON.stringify(courses));
    }
  }, [courses]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('edupro_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edupro_user');
    setSelectedCourseId(null);
  };

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
    // La confirmación ahora ocurre en el Dashboard vía modal.
    setCourses(prev => prev.filter(c => c.id !== id));
    if (selectedCourseId === id) setSelectedCourseId(null);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const currentCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <Layout user={user} onLogout={handleLogout} onHome={() => setSelectedCourseId(null)}>
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
        />
      )}
    </Layout>
  );
};

export default App;
