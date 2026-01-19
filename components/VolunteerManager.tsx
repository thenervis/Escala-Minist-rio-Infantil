
import React, { useState } from 'react';
import { Volunteer } from '../types';
import { UserPlus, Trash2, Search, Phone } from 'lucide-react';

interface VolunteerManagerProps {
  volunteers: Volunteer[];
  onAdd: (name: string, phone: string) => void;
  onDelete: (id: string) => void;
}

const VolunteerManager: React.FC<VolunteerManagerProps> = ({ volunteers, onAdd, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCanadianPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.substring(0, 10);
    if (limited.length <= 3) {
      return limited.length > 0 ? `(${limited}` : limited;
    } else if (limited.length <= 6) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3)}`;
    } else {
      return `(${limited.substring(0, 3)}) ${limited.substring(3, 6)} - ${limited.substring(6)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCanadianPhone(e.target.value);
    setNewPhone(formatted);
  };

  const filtered = volunteers.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPhone.replace(/\D/g, '').length === 10) {
      onAdd(newName, newPhone);
      setNewName('');
      setNewPhone('');
    } else {
      alert("Por favor, insira um telefone válido com 10 dígitos.");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Voluntários</h2>
        <p className="text-slate-500">Gestão da equipe do ministério.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-600" />
            Novo Voluntário
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone (Canadá)</label>
              <input 
                type="text" 
                value={newPhone}
                onChange={handlePhoneChange}
                placeholder="(555) 555 - 5555"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Adicionar
            </button>
          </form>
        </section>

        {/* Volunteer List */}
        <section className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar voluntário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Nome</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Contato</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length > 0 ? filtered.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{v.name}</p>
                        <p className="text-xs text-slate-400">Desde {new Date(v.joinedAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={14} className="text-indigo-400" />
                          <span className="text-sm font-mono">{v.phone}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => {
                            if(confirm(`Remover ${v.name}?`)) onDelete(v.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400">
                        Nenhum voluntário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VolunteerManager;
