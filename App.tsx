
import React, { useState, useEffect } from 'react';
import { Volunteer, Assignment, Room, AppTab } from './types';
import { INITIAL_ROOMS } from './constants';
import Dashboard from './components/Dashboard';
import ScheduleManager from './components/ScheduleManager';
import VolunteerManager from './components/VolunteerManager';
import Reports from './components/Reports';
import { LayoutDashboard, CalendarDays, Users, BarChart3, Church, Lock, Unlock, X } from 'lucide-react';

const ADMIN_CODE = "2025"; // Código de acesso para o modo gerencial

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginInput, setLoginInput] = useState<string>('');
  const [loginError, setLoginError] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    const savedVolunteers = localStorage.getItem('gestor_volunteers');
    const savedAssignments = localStorage.getItem('gestor_assignments');
    const savedManagerMode = localStorage.getItem('gestor_is_manager');
    
    if (savedVolunteers) setVolunteers(JSON.parse(savedVolunteers));
    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    if (savedManagerMode === 'true') setIsManager(true);
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('gestor_volunteers', JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem('gestor_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput === ADMIN_CODE) {
      setIsManager(true);
      localStorage.setItem('gestor_is_manager', 'true');
      setShowLoginModal(false);
      setLoginInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsManager(false);
    localStorage.setItem('gestor_is_manager', 'false');
    if (activeTab === AppTab.VOLUNTEERS || activeTab === AppTab.REPORTS) {
      setActiveTab(AppTab.DASHBOARD);
    }
  };

  const addVolunteer = (name: string, phone: string) => {
    const newVol: Volunteer = {
      id: crypto.randomUUID(),
      name,
      phone,
      isActive: true,
      joinedAt: new Date().toISOString()
    };
    setVolunteers(prev => [...prev, newVol]);
  };

  const deleteVolunteer = (id: string) => {
    setVolunteers(prev => prev.filter(v => v.id !== id));
    setAssignments(prev => prev.filter(a => a.volunteerId !== id));
  };

  const toggleAssignment = (date: string, roomId: string, volunteerId: string) => {
    setAssignments(prev => {
      const existing = prev.find(a => a.date === date && a.roomId === roomId && a.volunteerId === volunteerId);
      if (existing) {
        return prev.filter(a => a.id !== existing.id);
      } else {
        const newAssignment: Assignment = {
          id: crypto.randomUUID(),
          date,
          roomId,
          volunteerId
        };
        return [...prev, newAssignment];
      }
    });
  };

  const removeAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 md:relative md:flex-col md:w-64 md:border-r md:border-t-0 md:justify-start md:p-6 md:space-y-2">
        <div className="hidden md:flex items-center gap-3 mb-8 px-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Church size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Escala Joy</h1>
        </div>
        
        <NavItem 
          active={activeTab === AppTab.DASHBOARD} 
          onClick={() => setActiveTab(AppTab.DASHBOARD)} 
          icon={<LayoutDashboard size={20} />} 
          label="Início" 
        />
        <NavItem 
          active={activeTab === AppTab.SCHEDULE} 
          onClick={() => setActiveTab(AppTab.SCHEDULE)} 
          icon={<CalendarDays size={20} />} 
          label="Escala" 
        />
        
        {isManager && (
          <>
            <NavItem 
              active={activeTab === AppTab.VOLUNTEERS} 
              onClick={() => setActiveTab(AppTab.VOLUNTEERS)} 
              icon={<Users size={20} />} 
              label="Voluntários" 
            />
            <NavItem 
              active={activeTab === AppTab.REPORTS} 
              onClick={() => setActiveTab(AppTab.REPORTS)} 
              icon={<BarChart3 size={20} />} 
              label="Relatórios" 
            />
          </>
        )}

        <div className="pt-4 mt-auto border-t border-slate-100 hidden md:block">
          {isManager ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all font-bold text-sm"
            >
              <Unlock size={20} />
              Modo Gerente
            </button>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-50 transition-all font-medium text-sm"
            >
              <Lock size={20} />
              Sou Gerente
            </button>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Acesso Restrito</h2>
              <p className="text-slate-500 text-sm mt-2">Insira o código para liberar as ferramentas de gerenciamento.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                autoFocus
                value={loginInput}
                onChange={(e) => {
                  setLoginInput(e.target.value);
                  setLoginError(false);
                }}
                className={`w-full text-center text-2xl tracking-widest px-4 py-3 border rounded-2xl outline-none transition-all ${loginError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'}`}
                placeholder="****"
              />
              {loginError && <p className="text-rose-500 text-xs text-center font-bold">Código incorreto!</p>}
              <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all">
                Acessar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {activeTab === AppTab.DASHBOARD && (
            <Dashboard 
              volunteers={volunteers} 
              assignments={assignments} 
              rooms={rooms} 
              setActiveTab={setActiveTab}
              isManager={isManager}
            />
          )}
          {activeTab === AppTab.SCHEDULE && (
            <ScheduleManager 
              volunteers={volunteers} 
              assignments={assignments} 
              rooms={rooms}
              onToggleAssignment={toggleAssignment}
              onRemoveAssignment={removeAssignment}
              isManager={isManager}
            />
          )}
          {isManager && activeTab === AppTab.VOLUNTEERS && (
            <VolunteerManager 
              volunteers={volunteers} 
              onAdd={addVolunteer} 
              onDelete={deleteVolunteer}
            />
          )}
          {isManager && activeTab === AppTab.REPORTS && (
            <Reports 
              volunteers={volunteers} 
              assignments={assignments} 
              rooms={rooms}
            />
          )}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all ${
      active 
        ? 'bg-indigo-50 text-indigo-700 md:bg-indigo-600 md:text-white' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
    }`}
  >
    {icon}
    <span className="text-[10px] md:text-sm font-medium">{label}</span>
  </button>
);

export default App;
