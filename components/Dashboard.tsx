import React, { useState, useRef } from 'react';
import { Course } from '../types';
import { 
  Plus, 
  BookOpen, 
  Users, 
  ArrowRight, 
  Trash2, 
  Pencil, 
  X, 
  HardDrive, 
  Download, 
  Upload, 
  ShieldCheck
} from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface DashboardProps {
  courses: Course[];
  onAddCourse: (name: string, groupName: string) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onSelectCourse: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (data: string) => boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  courses, 
  onAddCourse, 
  onUpdateCourse, 
  onDeleteCourse, 
  onSelectCourse,
  onExportBackup,
  onImportBackup
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="space-y-16 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-5xl font-black text-[#020617] tracking-tighter">Mis Cursos</h1>
          <p className="flex items-center gap-2 mt-4 text-[#4f46e5] font-black text-[11px] uppercase tracking-[0.2em]">
            <ShieldCheck size={18} />
            Privacidad Local Garantizada
          </p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditingCourse(null); }} className="btn-action-blue w-full md:w-auto scale-110">
          <Plus size={24} strokeWidth={3} />
          Nuevo Curso
        </button>
      </div>

      {showAdd && (
        <div className="card-android border-4 border-[#4f46e5]/10 shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[#020617] font-black text-xs uppercase tracking-widest">Configuración de Curso</h3>
            <button onClick={() => setShowAdd(false)} className="p-4 bg-slate-100 rounded-2xl"><X size={24}/></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Nombre de Materia</label>
                <input 
                  className="w-full px-8 py-5 bg-slate-100 rounded-3xl border-none font-bold text-[#020617] text-lg focus:ring-4 focus:ring-[#4f46e5]/10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Física II"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Grupo</label>
                <input 
                  className="w-full px-8 py-5 bg-slate-100 rounded-3xl border-none font-bold text-[#020617] text-lg focus:ring-4 focus:ring-[#4f46e5]/10"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="Ej. 3-C"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-6 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => setShowAdd(false)} className="font-black text-[11px] uppercase text-slate-400">Cancelar</button>
              <button type="submit" className="btn-action-blue px-12">Guardar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {courses.map(course => (
          <div 
            key={course.id} 
            onClick={() => onSelectCourse(course.id)} 
            className="card-android group cursor-pointer border-transparent hover:border-[#4f46e5]/30 transition-all active:scale-95"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="p-6 bg-[#4f46e5]/10 text-[#4f46e5] rounded-[2rem] group-hover:bg-[#4f46e5] group-hover:text-white transition-all">
                <BookOpen size={32} />
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setEditingCourse(course); setName(course.name); setGroup(course.groupName); setShowAdd(true); }} className="p-3 bg-slate-50 rounded-xl text-slate-400"><Pencil size={18}/></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, courseId: course.id }); }} className="p-3 bg-red-50 rounded-xl text-red-400"><Trash2 size={18}/></button>
              </div>
            </div>
            <h2 className="text-3xl font-black text-[#020617] group-hover:text-[#4f46e5] transition-colors">{course.name}</h2>
            <p className="text-[#4f46e5] font-black text-[10px] uppercase tracking-[0.2em] mt-2">Grupo {course.groupName}</p>
            
            <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
              <span className="flex items-center gap-2 text-[#020617] font-black text-[10px] uppercase tracking-widest"><Users size={18} className="opacity-30"/> {course.students.length} Estudiantes</span>
              <ArrowRight size={24} className="text-slate-300 group-hover:text-[#4f46e5] transition-all" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#020617] rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4f46e5]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full text-white text-[10px] font-black uppercase mb-8 tracking-[0.3em]">
              <HardDrive size={18} /> Sistema de Respaldo
            </div>
            <h2 className="text-4xl font-black text-white">Seguridad sin nubes.</h2>
            <p className="text-white/50 text-lg font-medium mt-6">Tus archivos nunca salen de este teléfono. Exporta periódicamente para evitar pérdidas de datos.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
            <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => onImportBackup(ev.target?.result as string);
                reader.readAsText(file);
              }
            }} />
            <button onClick={onExportBackup} className="btn-action-blue min-w-[220px] bg-transparent border-2 border-white/20 hover:bg-white/10 shadow-none">
              <Download size={24} /> Exportar
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn-action-blue min-w-[220px]">
              <Upload size={24} /> Importar
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        title="¿Eliminar este curso?"
        message="Borrarás permanentemente todos los alumnos, asistencias y notas de este grupo. No se puede deshacer."
        onConfirm={() => deleteModal.courseId && onDeleteCourse(deleteModal.courseId)}
        onCancel={() => setDeleteModal({ isOpen: false, courseId: null })}
      />
    </div>
  );
};