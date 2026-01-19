
import React, { useMemo } from 'react';
import { Volunteer, Assignment, Room } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Send, TrendingUp, UserMinus } from 'lucide-react';

interface ReportsProps {
  volunteers: Volunteer[];
  assignments: Assignment[];
  rooms: Room[];
}

const Reports: React.FC<ReportsProps> = ({ volunteers, assignments, rooms }) => {
  // Cálculo de participações: Conta apenas dias únicos por voluntário
  const stats = useMemo(() => {
    return volunteers.map(v => {
      const volunteerAssignments = assignments.filter(a => a.volunteerId === v.id);
      const uniqueDates = new Set(volunteerAssignments.map(a => a.date));
      return {
        name: v.name,
        count: uniqueDates.size
      };
    }).sort((a, b) => b.count - a.count);
  }, [volunteers, assignments]);

  const inactiveVolunteers = volunteers.filter(v => 
    !assignments.some(a => a.volunteerId === v.id)
  );

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Métricas & Insights</h2>
        <p className="text-slate-500">Analise a participação da equipe (contagem por dias trabalhados).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Participation Chart */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-indigo-600" size={20} />
            <h3 className="font-bold text-lg">Top Participações (Dias)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value} dias`, 'Participação']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Inactive Volunteers */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <UserMinus className="text-red-500" size={20} />
            <h3 className="font-bold text-lg">Precisa de Incentivo</h3>
          </div>
          <p className="text-sm text-slate-500 mb-6 italic">Voluntários que ainda não serviram em nenhuma escala registrada.</p>
          
          <div className="space-y-3">
            {inactiveVolunteers.length > 0 ? inactiveVolunteers.map(v => (
              <div key={v.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-700 text-sm">{v.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{v.phone}</p>
                </div>
                <button 
                  onClick={() => window.open(`https://wa.me/${v.phone.replace(/\D/g,'')}`, '_blank')}
                  className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <Send size={14} />
                  Convidar
                </button>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-400">
                <p>Uau! Todos os voluntários já serviram pelo menos uma vez.</p>
              </div>
            )}
          </div>
        </section>

        {/* Summary Table */}
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg">Histórico de Engajamento</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Voluntário</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Total de Dias</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-right">Frequência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map(s => (
                <tr key={s.name}>
                  <td className="p-4 text-sm font-medium text-slate-700">{s.name}</td>
                  <td className="p-4 text-sm text-slate-600">{s.count} {s.count === 1 ? 'dia' : 'dias'}</td>
                  <td className="p-4 text-right">
                    <div className="inline-block w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${Math.min(s.count * 20, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Reports;
