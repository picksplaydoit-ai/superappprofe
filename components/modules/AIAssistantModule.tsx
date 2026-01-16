
import React, { useState, useRef, useEffect } from 'react';
import { Course, Student, Grade, Activity } from '../../types';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, Bot, User, MessageSquare, BrainCircuit, TrendingDown, Lightbulb, ClipboardCheck, Loader2 } from 'lucide-react';

interface AIAssistantModuleProps {
  course: Course;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIAssistantModule: React.FC<AIAssistantModuleProps> = ({ course }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `¡Hola! Soy tu asistente de EduPro. He analizado los datos de "${course.name}" y estoy listo para ayudarte a optimizar tu clase. ¿En qué puedo apoyarte hoy?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const generateContext = () => {
    const studentsSummary = course.students.map(s => {
      const studentGrades = course.grades.filter(g => g.studentId === s.id);
      const avg = studentGrades.length > 0 
        ? studentGrades.reduce((sum, g) => sum + g.value, 0) / studentGrades.length 
        : 0;
      return `- ${s.name}: Promedio actual ${avg.toFixed(1)}`;
    }).join('\n');

    const activitiesList = course.activities.map(a => `- ${a.name} (${a.gradingType})`).join('\n');

    return `
      Eres un Asistente Pedagógico Experto integrado en la app EduPro Manager.
      DATOS DEL CURSO ACTUAL:
      Nombre: ${course.name}
      Grupo: ${course.groupName}
      Alumnos y su estado actual:
      ${studentsSummary}
      Actividades registradas:
      ${activitiesList}
      Rúbrica: Mínimo asistencia ${course.rubric.minAttendance}%, Mínimo nota ${course.rubric.minGrade}.
      
      Instrucciones:
      1. Responde de forma profesional, motivadora y concisa.
      2. Usa los nombres de los alumnos si es necesario.
      3. Sugiere estrategias basadas en datos.
      4. Si no hay datos suficientes, indícalo amablemente.
    `;
  };

  const handleSend = async (forcedPrompt?: string) => {
    const textToSend = forcedPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: newMessages.map(m => ({ parts: [{ text: m.text }] })),
        config: {
          systemInstruction: generateContext(),
          temperature: 0.7,
        },
      });

      const responseText = response.text || "Lo siento, no pude procesar esa consulta.";
      setMessages([...newMessages, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages([...newMessages, { role: 'model', text: "Hubo un error de conexión con mi cerebro artificial. Por favor, intenta de nuevo." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Analizar Riesgos', icon: TrendingDown, prompt: '¿Qué alumnos están en riesgo de reprobar según sus notas y qué les falta?' },
    { label: 'Sugerir Dinámica', icon: Lightbulb, prompt: 'Sugiere una actividad creativa para este grupo que ayude a mejorar la participación.' },
    { label: 'Resumen Mensual', icon: ClipboardCheck, prompt: 'Dame un resumen ejecutivo del progreso del grupo en el último periodo.' },
  ];

  return (
    <div className="flex flex-col h-[600px] bg-slate-50/50 rounded-b-[2.5rem] overflow-hidden">
      {/* Header del Chat */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center gap-3 shadow-lg">
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest">Asistente Inteligente</h3>
          <p className="text-[9px] font-bold opacity-80 uppercase tracking-tighter">Powered by Gemini 3 Flash</p>
        </div>
      </div>

      {/* Area de Mensajes */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-100'
              }`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-white border border-indigo-100 flex items-center justify-center">
                <Loader2 size={16} className="text-indigo-400 animate-spin" />
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => handleSend(action.prompt)}
            disabled={isLoading}
            className="flex items-center gap-2 whitespace-nowrap bg-white border border-indigo-100 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all shadow-sm disabled:opacity-50"
          >
            <action.icon size={12} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Input de Chat */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative"
        >
          <input 
            type="text"
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-medium text-sm transition-all"
            placeholder="Escribe tu consulta pedagógica..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 active:scale-90 transition-all disabled:opacity-50 disabled:bg-slate-300"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
