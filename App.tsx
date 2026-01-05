
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings, 
  Plus, 
  Check, 
  X, 
  FileText, 
  Download, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Trophy, 
  UserPlus, 
  Dumbbell, 
  Menu, 
  MoreVertical, 
  Pencil, 
  Save, 
  CalendarDays,
  Smartphone,
  Cpu,
  Share2,
  Terminal,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  AlertTriangle,
  DownloadCloud,
  Copy,
  CheckCircle2,
  Globe,
  MonitorSmartphone,
  Info,
  Rocket,
  ArrowRight,
  Github
} from 'lucide-react';
import { AppData, Group, Person, Session, AttendanceRecord, AttendanceStatus } from './types';
import { loadData, saveData, generateId, isPolishHoliday, getStatusLabel } from './services/storageService';

// --- Context for global state ---
const AppContext = React.createContext<{
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
}>({
  data: loadData(),
  updateData: () => {},
});

// --- Helper Components ---

const CalendarView = ({ 
  currentDate, 
  onDateSelect, 
  sessions 
}: { 
  currentDate: Date, 
  onDateSelect: (date: Date) => void, 
  sessions: Session[] 
}) => {
  const [viewDate, setViewDate] = useState(currentDate);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const startDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const monthName = viewDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronLeft /></button>
        <h3 className="font-bold text-lg capitalize text-slate-800">{monthName}</h3>
        <button onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronRight /></button>
      </div>
      
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
        <div>PN</div><div>WT</div><div>ŚR</div><div>CZ</div><div>PT</div><div>SO</div><div>ND</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          
          const daySessions = sessions.filter(s => s.date === dateStr);
          const hasTraining = daySessions.some(s => s.type === 'CLASS');
          const hasCompetition = daySessions.some(s => s.type === 'COMPETITION');
          
          return (
            <div 
              key={day} 
              onClick={() => onDateSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative border 
                ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50'}
              `}
            >
              <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-slate-700'}`}>{day}</span>
              
              <div className="flex gap-1 mt-1 justify-center h-2">
                {hasTraining && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                {hasCompetition && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main App Components ---

// Fix: Implemented Sidebar component for navigation
const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Panel', icon: <BarChart3 size={20} /> },
    { path: '/groups', label: 'Grupy', icon: <Users size={20} /> },
    { path: '/players', label: 'Zawodnicy', icon: <UserPlus size={20} /> },
    { path: '/training', label: 'Obecność', icon: <Dumbbell size={20} /> },
    { path: '/reports', label: 'Raporty', icon: <FileText size={20} /> },
    { path: '/settings', label: 'Ustawienia', icon: <Settings size={20} /> },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
      >
        <Menu size={24} />
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static h-screen
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-black text-blue-600 flex items-center gap-2">
            <Trophy className="text-indigo-500" /> Matownik
          </h1>
          <p className="text-xs text-slate-400 font-medium">System obecności v4.8</p>
        </div>

        <nav className="mt-4 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-600 hover:bg-slate-50'}
              `}
            >
              {item.icon}
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

// Fix: Implemented Dashboard component to show stats and calendar
const Dashboard = () => {
  const { data } = useContext(AppContext);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    return {
      groups: data.groups.length,
      players: data.people.length,
      sessions: data.sessions.length,
      attendance: data.records.filter(r => r.status === AttendanceStatus.PRESENT).length,
    };
  }, [data]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Cześć!</h2>
        <p className="text-slate-500">Oto podsumowanie Twojej akademii.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Grupy', value: stats.groups, icon: <Users />, color: 'bg-blue-500' },
          { label: 'Zawodnicy', value: stats.players, icon: <UserPlus />, color: 'bg-green-500' },
          { label: 'Treningi', value: stats.sessions, icon: <Dumbbell />, color: 'bg-indigo-500' },
          { label: 'Obecności', value: stats.attendance, icon: <CheckCircle2 />, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl text-white ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <CalendarView 
          currentDate={new Date()} 
          sessions={data.sessions} 
          onDateSelect={(date) => {
            const dateStr = date.toISOString().split('T')[0];
            navigate(`/training?date=${dateStr}`);
          }} 
        />
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <h3 className="font-bold text-lg mb-4">Ostatnie sesje</h3>
          <div className="space-y-4">
            {data.sessions.slice(-5).reverse().map(session => {
              const group = data.groups.find(g => g.id === session.groupId);
              return (
                <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${session.type === 'CLASS' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {session.type === 'CLASS' ? <Dumbbell size={18} /> : <Trophy size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-700">{group?.name || 'Brak grupy'}</p>
                      <p className="text-xs text-slate-400">{session.date}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              );
            })}
            {data.sessions.length === 0 && <p className="text-center py-8 text-slate-400 text-sm italic">Brak zarejestrowanych treningów.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix: Implemented GroupManager component
const GroupManager = () => {
  const { data, updateData } = useContext(AppContext);
  const [isAdding, setIsAdding] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  const addGroup = () => {
    if (!newGroup.name) return;
    const group: Group = {
      id: generateId(),
      name: newGroup.name,
      description: newGroup.description,
    };
    updateData({ groups: [...data.groups, group] });
    setNewGroup({ name: '', description: '' });
    setIsAdding(false);
  };

  const deleteGroup = (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę grupę? Usunie to również zawodników z tej grupy.')) {
      updateData({
        groups: data.groups.filter(g => g.id !== id),
        people: data.people.filter(p => p.groupId !== id),
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Zarządzanie Grupami</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} /> Nowa Grupa
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-500 shadow-xl space-y-4">
          <h3 className="font-bold text-lg">Dodaj nową grupę</h3>
          <div className="grid gap-4">
            <input 
              type="text" 
              placeholder="Nazwa grupy (np. Rocznik 2015)" 
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newGroup.name}
              onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <input 
              type="text" 
              placeholder="Opis (opcjonalnie)" 
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newGroup.description}
              onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-bold">Anuluj</button>
            <button onClick={addGroup} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Zapisz</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {data.groups.map(group => (
          <div key={group.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group">
            <div>
              <h3 className="font-bold text-lg text-slate-800">{group.name}</h3>
              <p className="text-slate-500 text-sm">{group.description || 'Brak opisu'}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                <Users size={12} /> {data.people.filter(p => p.groupId === group.id).length} zawodników
              </div>
            </div>
            <button 
              onClick={() => deleteGroup(group.id)}
              className="p-2 text-red-400 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {data.groups.length === 0 && <p className="text-center py-12 text-slate-400 italic">Brak zdefiniowanych grup.</p>}
      </div>
    </div>
  );
};

// Fix: Implemented PlayerManager component
const PlayerManager = () => {
  const { data, updateData } = useContext(AppContext);
  const [isAdding, setIsAdding] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', birthYear: '', groupId: '' });

  const addPlayer = () => {
    if (!newPlayer.firstName || !newPlayer.lastName || !newPlayer.groupId) return;
    const player: Person = {
      id: generateId(),
      firstName: newPlayer.firstName,
      lastName: newPlayer.lastName,
      birthYear: newPlayer.birthYear,
      groupId: newPlayer.groupId,
    };
    updateData({ people: [...data.people, player] });
    setNewPlayer({ firstName: '', lastName: '', birthYear: '', groupId: '' });
    setIsAdding(false);
  };

  const deletePlayer = (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego zawodnika?')) {
      updateData({
        people: data.people.filter(p => p.id !== id),
        records: data.records.filter(r => r.personId !== id),
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Baza Zawodników</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-colors"
        >
          <UserPlus size={20} /> Dodaj Zawodnika
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border-2 border-green-500 shadow-xl space-y-4">
          <h3 className="font-bold text-lg">Nowy zawodnik</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Imię" 
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
              value={newPlayer.firstName}
              onChange={e => setNewPlayer({ ...newPlayer, firstName: e.target.value })}
            />
            <input 
              type="text" 
              placeholder="Nazwisko" 
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
              value={newPlayer.lastName}
              onChange={e => setNewPlayer({ ...newPlayer, lastName: e.target.value })}
            />
            <input 
              type="number" 
              placeholder="Rok urodzenia" 
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
              value={newPlayer.birthYear}
              onChange={e => setNewPlayer({ ...newPlayer, birthYear: e.target.value })}
            />
            <select 
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
              value={newPlayer.groupId}
              onChange={e => setNewPlayer({ ...newPlayer, groupId: e.target.value })}
            >
              <option value="">Wybierz grupę</option>
              {data.groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 font-bold">Anuluj</button>
            <button onClick={addPlayer} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold">Dodaj</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Zawodnik</th>
              <th className="p-4">Grupa</th>
              <th className="p-4">Urodzony</th>
              <th className="p-4">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.people.map(person => {
              const group = data.groups.find(g => g.id === person.groupId);
              return (
                <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">{person.firstName} {person.lastName}</td>
                  <td className="p-4 text-slate-500 text-sm">{group?.name || '-'}</td>
                  <td className="p-4 text-slate-500 text-sm">{person.birthYear || '-'}</td>
                  <td className="p-4">
                    <button onClick={() => deletePlayer(person.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.people.length === 0 && <p className="text-center py-12 text-slate-400 italic">Baza zawodników jest pusta.</p>}
      </div>
    </div>
  );
};

// Fix: Implemented TrainingManager component
const TrainingManager = () => {
  const { data, updateData } = useContext(AppContext);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSession, setNewSession] = useState({ 
    groupId: '', 
    date: new Date().toISOString().split('T')[0], 
    type: 'CLASS' as const, 
    topic: '' 
  });

  const createSession = () => {
    if (!newSession.groupId) return;
    const session: Session = {
      id: generateId(),
      groupId: newSession.groupId,
      date: newSession.date,
      type: newSession.type,
      topic: newSession.topic,
    };
    updateData({ sessions: [...data.sessions, session] });
    setActiveSession(session);
    setIsCreating(false);
  };

  const toggleAttendance = (personId: string) => {
    if (!activeSession) return;
    
    const existing = data.records.find(r => r.sessionId === activeSession.id && r.personId === personId);
    
    let newRecords;
    if (existing) {
      newRecords = data.records.map(r => 
        (r.sessionId === activeSession.id && r.personId === personId) 
          ? { ...r, status: r.status === AttendanceStatus.PRESENT ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT } 
          : r
      );
    } else {
      newRecords = [...data.records, {
        id: generateId(),
        sessionId: activeSession.id,
        personId: personId,
        status: AttendanceStatus.PRESENT
      }];
    }
    updateData({ records: newRecords });
  };

  const getGroupPlayers = (groupId: string) => data.people.filter(p => p.groupId === groupId);

  if (activeSession) {
    const players = getGroupPlayers(activeSession.groupId);
    const group = data.groups.find(g => g.id === activeSession.groupId);

    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-24">
        <button onClick={() => setActiveSession(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
          <ChevronLeft size={20} /> Powrót do listy
        </button>

        <header className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-800">{group?.name}</h2>
              <p className="text-slate-500 flex items-center gap-2 text-sm">
                <CalendarDays size={16} /> {activeSession.date} • {activeSession.type === 'CLASS' ? 'Trening' : 'Zawody'}
              </p>
            </div>
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">W trakcie</div>
          </div>
          {activeSession.topic && <p className="text-sm font-medium text-slate-600 italic">Temat: {activeSession.topic}</p>}
        </header>

        <div className="grid gap-2">
          {players.map(player => {
            const record = data.records.find(r => r.sessionId === activeSession.id && r.personId === player.id);
            const isPresent = record?.status === AttendanceStatus.PRESENT;
            
            return (
              <div 
                key={player.id} 
                onClick={() => toggleAttendance(player.id)}
                className={`
                  p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border-2
                  ${isPresent 
                    ? 'bg-white border-green-500 shadow-md translate-x-1' 
                    : 'bg-white border-slate-100 opacity-80'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isPresent ? 'bg-green-500' : 'bg-slate-300'}`}>
                    {player.firstName[0]}{player.lastName[0]}
                  </div>
                  <span className={`font-bold ${isPresent ? 'text-slate-800' : 'text-slate-400'}`}>
                    {player.firstName} {player.lastName}
                  </span>
                </div>
                <div className={`p-2 rounded-xl ${isPresent ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {isPresent ? <Check size={20} /> : <X size={20} />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pointer-events-none">
           <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between pointer-events-auto border border-slate-700">
             <div>
               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Frekwencja</p>
               <p className="text-xl font-black">
                 {data.records.filter(r => r.sessionId === activeSession.id && r.status === AttendanceStatus.PRESENT).length} / {players.length}
               </p>
             </div>
             <button onClick={() => setActiveSession(null)} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 text-sm">
               Zapisz <CheckCircle2 size={18} />
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Obecność</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200"
        >
          <Dumbbell size={20} /> Nowa Sesja
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-500 shadow-xl space-y-4">
          <h3 className="font-bold text-lg">Konfiguracja sesji</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <select 
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
              value={newSession.groupId}
              onChange={e => setNewSession({ ...newSession, groupId: e.target.value })}
            >
              <option value="">Wybierz grupę</option>
              {data.groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <input 
              type="date" 
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
              value={newSession.date}
              onChange={e => setNewSession({ ...newSession, date: e.target.value })}
            />
            <select 
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
              value={newSession.type}
              onChange={e => setNewSession({ ...newSession, type: e.target.value as any })}
            >
              <option value="CLASS">Trening</option>
              <option value="COMPETITION">Zawody</option>
            </select>
            <input 
              type="text" 
              placeholder="Temat zajęć" 
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
              value={newSession.topic}
              onChange={e => setNewSession({ ...newSession, topic: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-500 font-bold">Anuluj</button>
            <button onClick={createSession} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Zacznij</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {data.sessions.slice().reverse().map(session => {
          const group = data.groups.find(g => g.id === session.groupId);
          const attendanceCount = data.records.filter(r => r.sessionId === session.id && r.status === AttendanceStatus.PRESENT).length;
          const totalPlayers = data.people.filter(p => p.groupId === session.groupId).length;
          
          return (
            <div key={session.id} onClick={() => setActiveSession(session)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 cursor-pointer group transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${session.type === 'CLASS' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {session.type === 'CLASS' ? <Dumbbell size={24} /> : <Trophy size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{group?.name}</h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1">
                    <CalendarIcon size={12} /> {session.date} {session.topic && `• ${session.topic}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-700">{attendanceCount}/{totalPlayers}</p>
                <p className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Obecnych</p>
              </div>
            </div>
          ))}
          {data.sessions.length === 0 && <p className="text-center py-12 text-slate-400 italic">Brak sesji.</p>}
      </div>
    </div>
  );
};

// Fix: Implemented Reports component
const Reports = () => {
  const { data } = useContext(AppContext);

  const getAttendanceRate = (personId: string) => {
    const person = data.people.find(p => p.id === personId);
    if (!person) return 0;
    const sessions = data.sessions.filter(s => s.groupId === person.groupId);
    if (sessions.length === 0) return 0;
    const attended = data.records.filter(r => r.personId === personId && r.status === AttendanceStatus.PRESENT).length;
    return Math.round((attended / sessions.length) * 100);
  };

  const exportToCSV = () => {
    let csv = 'Imie;Nazwisko;Grupa;Frekwencja %\n';
    data.people.forEach(p => {
      const group = data.groups.find(g => g.id === p.groupId);
      csv += `${p.firstName};${p.lastName};${group?.name};${getAttendanceRate(p.id)}%\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'matownik_raport.csv';
    link.click();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Raporty</h2>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold shadow-lg"
        >
          <Download size={20} /> Eksportuj CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Zawodnik</th>
              <th className="p-4">Grupa</th>
              <th className="p-4">Frekwencja</th>
              <th className="p-4 w-48">Postęp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.people.map(person => {
              const group = data.groups.find(g => g.id === person.groupId);
              const rate = getAttendanceRate(person.id);
              
              return (
                <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">{person.firstName} {person.lastName}</td>
                  <td className="p-4 text-slate-500 text-sm">{group?.name || '-'}</td>
                  <td className="p-4">
                    <span className={`font-bold ${rate > 80 ? 'text-green-600' : rate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {rate}%
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${rate > 80 ? 'bg-green-500' : rate > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }}></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.people.length === 0 && <p className="text-center py-12 text-slate-400 italic">Brak danych do raportu.</p>}
      </div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-24 w-full">
      <h2 className="text-2xl font-bold text-slate-800">Udostępnianie aplikacji</h2>
      
      {/* SEKCJA: INSTRUKCJA GITHUB PAGES */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Github size={24} /> Jak aktywować link na GitHub
        </h3>
        <p className="text-sm opacity-80 mb-6">
          Skoro projekt jest już na GitHubie, wykonaj te 4 kroki, aby otrzymać link dla kolegi:
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
            <div>
              <p className="font-bold text-sm">Wejdź w Settings</p>
              <p className="text-xs opacity-60">To ostatnia zakładka na górnym pasku Twojego repozytorium.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
            <div>
              <p className="font-bold text-sm">Kliknij "Pages"</p>
              <p className="text-xs opacity-60">Znajdziesz to w menu po lewej stronie pod napisem "Code and automation".</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
            <div>
              <p className="font-bold text-sm">Wybierz Branch: main</p>
              <p className="text-xs opacity-60">W sekcji "Build and deployment" wybierz gałąź <strong>main</strong> i kliknij <strong>Save</strong>.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold"><Check size={18}/></div>
            <div>
              <p className="font-bold text-sm text-green-400">Twój Link!</p>
              <p className="text-xs opacity-80">Odśwież stronę po minucie. Link pojawi się na górze w ramce: <strong>"Your site is live at..."</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* SEKCJA: INSTRUKCJA DLA KOLEGI */}
      <div className="bg-white p-6 rounded-2xl border-2 border-green-500 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-[10px] font-bold">WYŚLIJ TO KOLEDZE</div>
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-slate-800">
          <Smartphone size={24} className="text-green-500" /> Co ma zrobić kolega?
        </h3>
        <p className="text-sm text-slate-600 mb-6">
           Gdy już będziesz mieć link z GitHub Pages, wyślij go koledze z tą instrukcją:
        </p>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ExternalLink size={20}/></div>
             <p className="text-xs">Otwórz ten link w przeglądarce <strong>Chrome</strong> na telefonie.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
             <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Plus size={20}/></div>
             <p className="text-xs">Kliknij 3 kropki (menu) i wybierz <strong>"Dodaj do ekranu głównego"</strong> lub <strong>"Zainstaluj aplikację"</strong>.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-lg mb-2 text-slate-800">Zarządzanie bazą</h3>
        <button onClick={() => { if(window.confirm("Czy na pewno chcesz usunąć wszystkich zawodników i historię?")) { localStorage.clear(); window.location.reload(); } }} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"><Trash2 size={16} /> Wyczyść dane (Reset)</button>
      </div>

      <div className="text-center text-xs text-slate-400 mt-8">
        <p>Matownik v4.8 - GitHub Pages Support</p>
      </div>
    </div>
  );
};

export default function App() {
  const [data, setDataState] = useState<AppData>(loadData);
  const updateData = (newData: Partial<AppData>) => { setDataState(prev => { const next = { ...prev, ...newData }; saveData(next); return next; }); };
  
  return (
    <AppContext.Provider value={{ data, updateData }}>
      <HashRouter>
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto max-h-screen md:ml-64 w-full relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/groups" element={<GroupManager />} />
              <Route path="/players" element={<PlayerManager />} />
              <Route path="/training" element={<TrainingManager />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
}
