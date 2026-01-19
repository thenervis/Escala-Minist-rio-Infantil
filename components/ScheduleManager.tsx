
import React, { useState, useMemo } from 'react';
import { Volunteer, Assignment, Room } from '../types';
import { MONTHS } from '../constants';
import { Calendar, Trash2, Wand2, Loader2, AlertTriangle, CheckCircle2, Share2 } from 'lucide-react';
import { getSmartSuggestions } from '../services/geminiService';

interface ScheduleManagerProps {
  volunteers: Volunteer[];
  assignments: Assignment[];
  rooms: Room[];
  onToggleAssignment: (date: string, roomId: string, volunteerId: string) => void;
  onRemoveAssignment: (id: string) => void;
  isManager: boolean;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ 
  volunteers, assignments, rooms, onToggleAssignment, onRemoveAssignment, isManager
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [isAiLoading, setIsAiLoading] = useState(false);

  const saturdays = useMemo(() => {
    const dates = [];
    const date = new Date(selectedYear, selectedMonth, 1);
    while (date.getMonth() === selectedMonth) {
      if (date.getDay() === 6) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }, [selectedMonth, selectedYear]);

  const handleAiSuggestions = async (date: string) => {
    if (!isManager) return;
    if (volunteers.length < 5) {
      alert("Adicione mais voluntários antes de pedir sugestões da IA.");
      return;
    }
    setIsAiLoading(true);
    const suggestions = await getSmartSuggestions(volunteers, rooms, assignments, date);
    if (suggestions) {
      suggestions.forEach((s: any) => {
        onToggleAssignment(date, s.roomId, s.volunteerId);
      });
    }
    setIsAiLoading(false);
  };

  const handleShareWhatsApp = (date: string) => {
    const dateAssignments = assignments.filter(a => a.date === date);
    const dateFormatted = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { 
      weekday: 'long', day: 'numeric', month: 'long' 
    });
    
    let text = `*🎒 ESCALA JOY - ${dateFormatted.toUpperCase()}*\n\n`;
    
    rooms.forEach(room => {
      const assigned = dateAssignments.filter(a => a.roomId === room.id);
      const names = assigned.map(a => volunteers.find(v => v.id === a.volunteerId)?.name).filter(Boolean);
      text += `*${room.name}*: ${names.length > 0 ? names.join(', ') : '❌ _Vago_'}\n`;
    });
    
    text += `\n_Gerado via Escala Ministério Infantil Joy_`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Escala Joy</h2>
          <p className="text-slate-500">Selecione o seu nome para garantir sua vaga no sábado.</p>
        </div>
        
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600"
          >
            Anterior
          </button>
          <div className="px-4 font-bold text-indigo-600 min-w-[140px] text-center">
            {MONTHS[selectedMonth]} {selectedYear}
          </div>
          <button 
            onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600"
          >
            Próximo
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
        {saturdays.map(date => (
          <div key={date} className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-slate-50/50 p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-indigo-600" size={20} />
                <span className="font-bold text-slate-700">
                  {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              {isManager && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleShareWhatsApp(date)}
                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                  >
                    <Share2 size={14} />
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => handleAiSuggestions(date)}
                    disabled={isAiLoading || volunteers.length === 0}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isAiLoading ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                    IA
                  </button>
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Função</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Escalados</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Escalar</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => {
                    const roomAssignments = assignments.filter(a => a.date === date && a.roomId === room.id);
                    const dayAssignments = assignments.filter(a => a.date === date);
                    const isFull = roomAssignments.length >= room.capacity;
                    
                    return (
                      <tr key={room.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/20 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{room.name}</p>
                        </td>
                        <td className="p-4">
                          {isFull ? (
                            <div className="flex items-center gap-1 text-green-600 text-[10px] font-black uppercase">
                              <CheckCircle2 size={12} /> Completo
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black uppercase">
                              <AlertTriangle size={12} /> {room.capacity - roomAssignments.length} vaga(s)
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {roomAssignments.map(assignment => {
                              const vol = volunteers.find(v => v.id === assignment.volunteerId);
                              const isDoubling = dayAssignments.filter(a => a.volunteerId === assignment.volunteerId).length > 1;
                              
                              return (
                                <div key={assignment.id} className={`flex items-center gap-2 border px-2.5 py-1 rounded-lg ${isDoubling ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200'}`}>
                                  <span className="text-xs font-medium text-slate-700">
                                    {vol?.name || '---'}
                                  </span>
                                  <button 
                                    onClick={() => onRemoveAssignment(assignment.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <select 
                            disabled={isFull}
                            className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-30"
                            onChange={(e) => {
                              if (e.target.value) {
                                onToggleAssignment(date, room.id, e.target.value);
                                e.target.value = "";
                              }
                            }}
                            value=""
                          >
                            <option value="">+ ESCALAR</option>
                            {volunteers
                              .filter(v => v.isActive && !roomAssignments.some(a => a.volunteerId === v.id))
                              .map(v => (
                                <option key={v.id} value={v.id}>
                                  {v.name}
                                </option>
                              ))
                            }
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleManager;
