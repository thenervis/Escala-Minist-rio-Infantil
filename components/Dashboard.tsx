
import React, { useState, useEffect } from 'react';
import { Volunteer, Assignment, Room, AppTab } from '../types';
import { Users, Calendar, AlertCircle, ChevronRight, Church, Share2, ChevronLeft } from 'lucide-react';

interface DashboardProps {
  volunteers: Volunteer[];
  assignments: Assignment[];
  rooms: Room[];
  setActiveTab: (tab: AppTab) => void;
  isManager: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ volunteers, assignments, rooms, setActiveTab, isManager }) => {
  const getInitialSaturday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek + 7) % 7;
    const resultDate = new Date();
    resultDate.setDate(now.getDate() + daysUntilSaturday);
    
    const year = resultDate.getFullYear();
    const month = String(resultDate.getMonth() + 1).padStart(2, '0');
    const day = String(resultDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [viewDate, setViewDate] = useState(getInitialSaturday());

  const navigateSaturday = (direction: 'next' | 'prev') => {
    const current = new Date(viewDate + 'T12:00:00');
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    setViewDate(`${year}-${month}-${day}`);
  };

  const currentAssignments = assignments.filter(a => a.date === viewDate);
  const totalSlots = rooms.reduce((acc, room) => acc + room.capacity, 0);
  const inactiveCount = volunteers.filter(v => !assignments.some(a => a.volunteerId === v.id)).length;

  const handleShareWhatsApp = () => {
    const dateFormatted = new Date(viewDate + 'T12:00:00').toLocaleDateString('pt-BR', { 
      weekday: 'long', day: 'numeric', month: 'long' 
    });
    
    let text = `*🎒 ESCALA JOY - ${dateFormatted.toUpperCase()}*\n\n`;
    
    rooms.forEach(room => {
      const assigned = currentAssignments.filter(a => a.roomId === room.id);
      const names = assigned.map(a => volunteers.find(v => v.id === a.volunteerId)?.name).filter(Boolean);
      text += `*${room.name}*: ${names.length > 0 ? names.join(', ') : '❌ _Vago_'}\n`;
    });
    
    text += `\n_Gerado via Escala Ministério Infantil Joy_`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Painel Joy</h2>
          <p className="text-slate-500">{isManager ? 'Acesso rápido às escalas e equipe.' : 'Confira ou altere sua escala abaixo.'}</p>
        </div>
        {isManager && (
          <button 
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95"
          >
            <Share2 size={18} />
            Compartilhar Escala
          </button>
        )}
      </header>

      {/* Stats Grid - Hidden for non-managers to focus on the scale */}
      {isManager && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Equipe Total</p>
              <p className="text-2xl font-bold text-slate-800">{volunteers.length}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Vagas Preenchidas</p>
              <p className="text-2xl font-bold text-slate-800">{currentAssignments.length}/{totalSlots}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-rose-100 text-rose-600 p-3 rounded-xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Sem Escalar</p>
              <p className="text-2xl font-bold text-slate-800">{inactiveCount}</p>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isManager ? 'lg:grid-cols-2' : ''} gap-8`}>
        {/* Weekly View with Selector */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigateSaturday('prev')}
                className="p-1 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <ChevronLeft size={20} className="text-slate-400" />
              </button>
              <h3 className="font-bold text-slate-800 min-w-[180px] text-center">
                {new Date(viewDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </h3>
              <button 
                onClick={() => navigateSaturday('next')}
                className="p-1 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            </div>
            <button 
              onClick={() => setActiveTab(AppTab.SCHEDULE)}
              className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all"
            >
              {isManager ? 'Gerenciar' : 'Me Escalar'} <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="p-6 space-y-3">
            {rooms.map(room => {
              const roomAssignments = currentAssignments.filter(a => a.roomId === room.id);
              const isFull = roomAssignments.length >= room.capacity;
              
              return (
                <div key={room.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex-1">
                    <p className="font-bold text-slate-700 text-sm">{room.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {roomAssignments.length > 0 ? roomAssignments.map(a => {
                        const vol = volunteers.find(v => v.id === a.volunteerId);
                        return (
                          <span key={a.id} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600 font-bold">
                            {vol?.name}
                          </span>
                        );
                      }) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">Vaga disponível</span>
                      )}
                    </div>
                  </div>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${isFull ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                    <span className="text-xs font-black">{roomAssignments.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {isManager && (
          <section className="space-y-6">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-indigo-200 shadow-xl">
              <div className="relative z-10">
                <Church className="mb-4 text-indigo-300" size={32} />
                <h3 className="text-2xl font-bold mb-2">Gestão Joy</h3>
                <p className="text-indigo-100 mb-6 text-sm leading-relaxed opacity-90">
                  Lembre-se de entrar em contato com os {inactiveCount} voluntários que ainda não participaram este mês.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveTab(AppTab.VOLUNTEERS)}
                    className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
                  >
                    Ver Voluntários
                  </button>
                  <button 
                    onClick={() => setActiveTab(AppTab.REPORTS)}
                    className="bg-indigo-500/50 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all active:scale-95"
                  >
                    Relatórios
                  </button>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 bg-white/10 w-48 h-48 rounded-full blur-3xl"></div>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
               <h3 className="font-bold text-lg text-slate-800 mb-4">Dica da Joy</h3>
               <div className="flex gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                 <div className="bg-amber-100 p-2 rounded-xl h-fit">
                  <AlertCircle className="text-amber-600" size={20} />
                 </div>
                 <div>
                   <p className="text-amber-900 font-bold text-sm">Escala Incompleta?</p>
                   <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                     Se faltarem voluntários para {new Date(viewDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}, 
                     use a <strong>IA de Auto-Preenchimento</strong> na aba Escala para sugerir os melhores nomes baseados na frequência de cada um.
                   </p>
                 </div>
               </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
