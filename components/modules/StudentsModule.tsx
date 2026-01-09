
import React, { useState } from 'react';
import { Course, Student } from '../../types';
import { FileDown, Trash2, Users, Search, CheckCircle2, X } from 'lucide-react';
import { ConfirmationModal } from '../ConfirmationModal';

interface StudentsModuleProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
}

export const StudentsModule: React.FC<StudentsModuleProps> = ({ course, onUpdate }) => {
  const [importText, setImportText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(course.students.length === 0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    id?: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'single',
    title: '',
    message: ''
  });

  const handleImport = () => {
    if (!importText.trim()) return;
    const names = importText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    const newStudents: Student[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name
    }));
    
    const existingNames = new Set(course.students.map(s => s.name.toLowerCase()));
    const filteredNew = newStudents.filter(s => !existingNames.has(s.name.toLowerCase()));
    
    onUpdate({ students: [...course.students, ...filteredNew] });
    setImportText('');
    setShowImport(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const confirmDeleteStudent = (id: string, name: string) => {
    setModalConfig({
      isOpen: true,
      type: 'single',
      id,
      title: `¿Eliminar a ${name}?`,
      message: 'Se borrarán todas sus asistencias y calificaciones registradas en este curso de forma permanente.'
    });
  };

  const confirmDeleteAll = () => {
    setModalConfig({
      isOpen: true,
      type: 'all',
      title: '¿Vaciar lista completa?',
      message: 'ATENCIÓN: Se eliminarán TODOS los alumnos del curso actual junto con sus registros. Útil si deseas reciclar el curso para un nuevo semestre.'
    });
  };

  const executeDelete = () => {
    if (modalConfig.type === 'single' && modalConfig.id) {
      onUpdate({
        students: course.students.filter(s => s.id !== modalConfig.id),
        attendance: course.attendance.filter(a => a.studentId !== modalConfig.id),
        grades: course.grades.filter(g => g.studentId !== modalConfig.id)
      });
    } else if (modalConfig.type === 'all') {
      onUpdate({
        students: [],
        attendance: [],
        grades: []
      });
      setShowImport(true);
    }
  };

  const filteredStudents = [...course.students]
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Gestión de Estudiantes
            <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg text-xs font-black">{course.students.length}</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Control de Inscripciones</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => setShowImport(!showImport)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            <FileDown size={18} />
            Importar Alumnos
          </button>
          {course.students.length > 0 && (
            <button 
              type="button"
              onClick={confirmDeleteAll}
              className="flex items-center justify-center p-2.5 text-red-500 hover:text-white hover:bg-red-600 border border-red-200 bg-red-50 rounded-xl transition-all shadow-sm active:scale-90"
              title="Vaciar lista de alumnos"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {isSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3 text-green-700 font-bold text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          ¡Estudiantes actualizados!
        </div>
      )}

      {showImport && (
        <div className="mb-8 bg-white p-6 rounded-3xl border-2 border-indigo-100 animate-in zoom-in-95 duration-300 shadow-xl shadow-indigo-50/20">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-indigo-900">Importación Masiva</h3>
             <button type="button" onClick={() => setShowImport(false)} className="text-slate-300 hover:text-slate-500"><X size={20}/></button>
          </div>
          <p className="text-[10px] text-indigo-400 mb-4 font-black uppercase tracking-widest">Pega la lista de nombres (uno por renglón)</p>
          <textarea 
            className="w-full h-48 p-4 border border-indigo-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 bg-slate-50 font-medium text-sm transition-all placeholder:text-slate-300"
            placeholder="Juan Manuel Pérez..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          ></textarea>
          <div className="flex justify-end mt-5 gap-3">
            <button 
              type="button"
              onClick={() => setShowImport(false)} 
              className="px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleImport} 
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg active:scale-95 transition-all"
            >
              Cargar Lista
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-300" />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por nombre..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div key={student.id} className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0 uppercase shadow-sm">
                {student.name.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-slate-700 truncate text-sm">{student.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {student.id.toUpperCase()}</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => confirmDeleteStudent(student.id, student.name)}
              className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
              title="Eliminar de este curso"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={executeDelete}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
};
