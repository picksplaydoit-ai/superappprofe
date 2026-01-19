
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
  ShieldCheck, 
  AlertCircle,
  Shield,
  ChevronDown,
  ChevronUp
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
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPrivacy, setShowPrivacy] = useState(false);
  
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

  const openEdit = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setEditingCourse(course);
    setName(course.name);
    setGroup(course.groupName);
    setShowAdd(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = onImportBackup(content);
        if (success) {
          setImportStatus('success');
          setTimeout(() => setImportStatus('idle'), 3000);
        } else {
          setImportStatus('error');
          setTimeout(() => setImportStatus('idle'), 3000);
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mis Cursos</h1>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Almacenamiento Local Seguro</span>
          </div>
        </div>
        <button 
          onClick={() => {
            setShowAdd(!showAdd);
            setEditingCourse(null);
            setName('');
            setGroup('');
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 font-black text-xs uppercase tracking-widest"
        >
          <Plus size={20} />
          Nuevo Curso
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2.5rem] border border-indigo-100 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-slate-800 uppercase text-xs tracking-widest">{editingCourse ? 'Editar Detalles del Curso' : 'Configurar Nuevo Curso'}</h2>
            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-300 hover:text-slate-600 p-2 bg-slate-50 rounded-xl"><X size={20}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre de la Materia</label>
              <input 
                type="text" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 bg-slate-50 transition-all text-sm"
                placeholder="Ej. Matemáticas Avanzadas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Identificador de Grupo</label>
              <input 
                type="text" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 bg-slate-50 transition-all text-sm"
                placeholder="Ej. 6° Semestre - A"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
            <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">
              {editingCourse ? 'Guardar Cambios' : 'Registrar Curso'}
            </button>
          </div>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-50 p-8 rounded-full mb-6 text-indigo-300 shadow-inner">
            <BookOpen size={64} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Panel de Control Vacío</h2>
          <p className="text-slate-400 mt-3 max-w-sm font-bold text-sm leading-relaxed uppercase tracking-tight">Comienza agregando un curso para gestionar el progreso académico localmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-400 transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <BookOpen size={24} />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => openEdit(e, course)}
                    className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal({ isOpen: true, courseId: course.id });
                    }}
                    className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                  Grupo {course.groupName}
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-6">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase tracking-widest">
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <Users size={14} className="text-slate-400" />
                  </div>
                  <span>{course.students.length} ESTUDIANTES</span>
                </div>
                <div className="bg-slate-50 text-slate-400 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1 border border-slate-100">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sección de Respaldo y Seguridad */}
      <div className="mt-12 bg-slate-900 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <HardDrive size={12} />
              Centro de Respaldo y Seguridad
            </div>
            <h2 className="text-2xl font-black mb-3">Tus datos te pertenecen.</h2>
            <p className="text-indigo-200/60 text-sm font-bold leading-relaxed">
              EduPro funciona de forma 100% local. Para asegurar tu información, te recomendamos descargar un respaldo periódicamente o antes de cambiar de dispositivo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={onExportBackup}
              className="flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl"
            >
              <Download size={20} />
              Exportar Respaldo
            </button>
            
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-900/40"
            >
              <Upload size={20} />
              Importar Datos
            </button>
          </div>
        </div>

        {importStatus !== 'idle' && (
          <div className={`mt-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            importStatus === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {importStatus === 'success' ? <ShieldCheck size={20}/> : <AlertCircle size={20}/>}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {importStatus === 'success' ? 'Base de datos restaurada con éxito' : 'Error: El archivo no es un respaldo válido de EduPro'}
            </span>
          </div>
        )}
      </div>

      {/* Política de Privacidad */}
      <div className="mt-4 border-t border-slate-200 pt-6">
        <button 
          onClick={() => setShowPrivacy(!showPrivacy)}
          className="flex items-center gap-3 mx-auto px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95"
        >
          <Shield size={18} className={showPrivacy ? 'text-indigo-600' : 'text-slate-400'} />
          <span className="text-[10px] font-black uppercase tracking-widest">Política de Privacidad</span>
          {showPrivacy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showPrivacy && (
          <div className="mt-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-xl font-black text-indigo-600 mb-6">Política de Privacidad</h2>
            
            <div className="space-y-4 text-slate-600 text-sm font-medium leading-relaxed">
              <p className="font-bold text-slate-800 italic">EduPro Manager respeta tu privacidad.</p>
              
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <p>
                  Esta aplicación funciona de forma <span className="text-indigo-600 font-black">100% local</span>. 
                  No recopilamos, almacenamos ni compartimos información personal.
                </p>
              </div>

              <p>
                Todos los datos (cursos, alumnos, asistencias y calificaciones) 
                se guardan únicamente en el dispositivo del usuario.
              </p>

              <p className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-500">
                EduPro Manager no utiliza servidores externos ni envía datos a internet.
              </p>

              <p>
                El usuario es responsable de respaldar su información mediante la función 
                de exportación disponible en la aplicación.
              </p>

              <p className="text-red-500/70 text-xs">
                Si no estás de acuerdo con esta política, puedes dejar de usar la aplicación 
                eliminándola del dispositivo.
              </p>

              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Última actualización: 2026</span>
                <button 
                  onClick={() => setShowPrivacy(false)}
                  className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
