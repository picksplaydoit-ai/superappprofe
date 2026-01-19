
import React, { useState, useRef } from 'react';
import { Course, Student } from '../../types';
import { FileDown, Trash2, Users, Search, CheckCircle2, X, FileSpreadsheet, UploadCloud, Loader2 } from 'lucide-react';
import { ConfirmationModal } from '../ConfirmationModal';
import * as XLSX from 'xlsx';

interface StudentsModuleProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
}

export const StudentsModule: React.FC<StudentsModuleProps> = ({ course, onUpdate }) => {
  const [importText, setImportText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(course.students.length === 0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processNamesAndAdd = (names: string[]) => {
    // 1. Limpieza profunda y filtrado de nombres vacíos o muy cortos
    const rawCleaned = names
      .map(n => n.replace(/[\r\t]/g, '').trim()) // Eliminar retornos de carro y tabs
      .filter(n => n.length >= 2);

    if (rawCleaned.length === 0) return;

    // 2. Eliminar duplicados dentro del mismo bloque de texto pegado (Case Insensitive)
    const uniqueInPaste: string[] = [];
    const seenInPaste = new Set<string>();
    
    for (const name of rawCleaned) {
      const lower = name.toLowerCase();
      if (!seenInPaste.has(lower)) {
        seenInPaste.add(lower);
        uniqueInPaste.push(name);
      }
    }

    // 3. Filtrar contra alumnos ya existentes en el curso
    const existingNames = new Set(course.students.map(s => s.name.toLowerCase()));
    const finalNewStudents: Student[] = uniqueInPaste
      .filter(name => !existingNames.has(name.toLowerCase()))
      .map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name
      }));

    if (finalNewStudents.length > 0) {
      onUpdate({ students: [...course.students, ...finalNewStudents] });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      setShowImport(false);
      setImportText('');
    } else {
      // Feedback si no se agregó nada por ser duplicados
      alert("Los alumnos ya están en la lista o los nombres son inválidos.");
    }
  };

  const handleTextImport = () => {
    if (!importText.trim()) return;
    // Split flexible: Saltos de línea, comas o puntos y coma
    const names = importText.split(/[\n\r,;]+/);
    processNamesAndAdd(names);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Extraer nombres de la primera columna que tenga contenido
        const names = json
          .map(row => (row && row[0] ? String(row[0]) : ""))
          .filter(val => val.length > 1);

        processNamesAndAdd(names);
      } catch (error) {
        console.error("Error al procesar Excel:", error);
        alert("No se pudo procesar el archivo. Asegúrate de que sea un Excel o CSV válido.");
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
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
      message: 'ATENCIÓN: Se eliminarán TODOS los alumnos del curso actual junto con sus registros.'
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
            <UploadCloud size={18} />
            Importar
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
          ¡Estudiantes actualizados correctamente!
        </div>
      )}

      {showImport && (
        <div className="mb-8 bg-white p-6 rounded-3xl border-2 border-indigo-100 animate-in zoom-in-95 duration-300 shadow-xl shadow-indigo-50/20">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Método de Importación</h3>
             <button type="button" onClick={() => setShowImport(false)} className="text-slate-300 hover:text-slate-500 bg-slate-50 p-1 rounded-lg"><X size={20}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed flex flex-col items-center text-center">
              <div className="bg-green-100 text-green-600 p-4 rounded-2xl mb-4">
                <FileSpreadsheet size={32} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">Archivo Excel / CSV</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-5 leading-relaxed">Sube tu lista desde un archivo .xlsx o .csv</p>
              
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleExcelImport}
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full bg-white border-2 border-green-500 text-green-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={16} />}
                {isProcessing ? 'Procesando...' : 'Seleccionar Archivo'}
              </button>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <FileDown size={16} className="text-indigo-600" />
                <h4 className="font-bold text-slate-800 text-sm">Pegar Lista</h4>
              </div>
              <textarea 
                className="flex-1 w-full min-h-[120px] p-4 border border-indigo-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 bg-slate-50 font-medium text-sm transition-all placeholder:text-slate-300 resize-none"
                placeholder="Un nombre por renglón o separados por comas..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              ></textarea>
              <button 
                type="button"
                onClick={handleTextImport} 
                disabled={!importText.trim()}
                className="mt-3 bg-indigo-600 text-white w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg disabled:opacity-50 transition-all"
              >
                Procesar Lista
              </button>
            </div>
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
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
             <Users size={32} className="mx-auto text-slate-300 mb-3" />
             <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Sin resultados</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
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
          ))
        )}
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
