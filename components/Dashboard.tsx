
import React, { useState } from 'react';
import { Course } from '../types';
import { Plus, BookOpen, Users, ArrowRight, Trash2, Pencil, X } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface DashboardProps {
  courses: Course[];
  onAddCourse: (name: string, groupName: string) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onSelectCourse: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ courses, onAddCourse, onUpdateCourse, onDeleteCourse, onSelectCourse }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; courseId: string | null }>({
    isOpen: false,
    courseId: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && group) {
      if (editingCourse) {
        onUpdateCourse({ ...editingCourse, name, groupName: group });
        setEditingCourse(null);
      } else {
        onAddCourse(name, group);
      }
      setName('');
      setGroup('');
      setShowAdd(false);
    }
  };

  const openEdit = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setEditingCourse(course);
    setName(course.name);
    setGroup(course.groupName);
    setShowAdd(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Mis Cursos</h1>
        <button 
          onClick={() => {
            setShowAdd(!showAdd);
            setEditingCourse(null);
            setName('');
            setGroup('');
          }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 font-bold text-sm"
        >
          <Plus size={20} />
          Nuevo Curso
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border-2 border-indigo-50 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800">{editingCourse ? 'Editar Curso' : 'Configurar Nuevo Curso'}</h2>
            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-300 hover:text-slate-600 p-1"><X size={24}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre del Curso</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-700 bg-slate-50 transition-all"
                placeholder="Ej. Física Aplicada"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Identificador de Grupo</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-700 bg-slate-50 transition-all"
                placeholder="Ej. 2-B Matutino"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
            <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">
              {editingCourse ? 'Actualizar' : 'Registrar Curso'}
            </button>
          </div>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-300 shadow-inner">
            <BookOpen size={64} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Panel de Control Vacío</h2>
          <p className="text-slate-400 mt-2 max-w-sm font-medium">Comienza agregando un curso para gestionar el progreso académico de tus alumnos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-400 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <BookOpen size={28} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => openEdit(e, course)}
                    className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                    title="Editar detalles"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal({ isOpen: true, courseId: course.id });
                    }}
                    className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                    title="Eliminar curso completo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  Grupo {course.groupName}
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-6">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                  <div className="bg-slate-100 p-1.5 rounded-lg">
                    <Users size={16} className="text-slate-400" />
                  </div>
                  <span>{course.students.length} ESTUDIANTES</span>
                </div>
                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        title="¿Eliminar este curso?"
        message="Esta acción eliminará permanentemente todos los alumnos, asistencias y calificaciones registradas en este grupo. Esta acción no se puede deshacer."
        onConfirm={() => deleteModal.courseId && onDeleteCourse(deleteModal.courseId)}
        onCancel={() => setDeleteModal({ isOpen: false, courseId: null })}
      />
    </div>
  );
};
