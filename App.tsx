
import React, { useState, useEffect, useMemo, useContext, createContext } from 'react';
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
  Info
} from 'lucide-react';
import { AppData, Group, Person, Session, AttendanceRecord, AttendanceStatus } from './types.ts';
import { loadData, saveData, generateId, isPolishHoliday, getStatusLabel } from './services/storageService.ts';

// --- Context for global state ---
const AppContext = createContext<{
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

const EditPlayerModal = ({ 
  person, 
  groups, 
  onClose, 
  onSave 
}: { 
  person: Person, 
  groups: Group[], 
  onClose: () => void, 
  onSave: (updatedPerson: Person) => void 
}) => {
  const [formData, setFormData] = useState({
    firstName: person.firstName,
    lastName: person.lastName,
    birthYear: person.birthYear || '',
    groupId: person.groupId
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...person,
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthYear: formData.birthYear,
      groupId: formData.groupId
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">Edytuj Zawodnika</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Imię</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Nazwisko</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-800 text-white"
              required
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-500 mb-1">Rocznik</label>
             <input
              type="number"
              value={formData.birthYear}
              onChange={e => setFormData({...formData, birthYear: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-800 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Grupa</label>
            <select
              value={formData.groupId}
              onChange={e => setFormData({...formData, groupId: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-800 text-white"
            >
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">
              Anuluj
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Zapisz Zmiany
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Components ---

const Sidebar = () => {
  const location = useLocation();
  
  const desktopNavItems = [
    { icon: BarChart3, label: 'Pulpit', path: '/' },
    { icon: Users, label: 'Grupy', path: '/groups' },
    { icon: UserPlus, label: 'Zawodnicy', path: '/players' },
    { icon: Dumbbell, label: 'Trening', path: '/training' },
    { icon: FileText, label: 'Raporty', path: '/reports' },
    { icon: Settings, label: 'Ustawienia', path: '/settings' },
  ];

  const mobileNavItems = [
    { icon: BarChart3, label: 'Pulpit', path: '/' },
    { icon: FileText, label: 'Raporty', path: '/reports' },
  ];

  return (
    <>
      <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-shrink-0 h-screen flex-col no-print fixed left-0 top-0 bottom-0 z-30">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
          <h1 className="text-xl font-bold text-slate-800">Matownik</h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {desktopNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="md:hidden bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-30 no-print w-full">
        <div className="flex items-center justify-between px-4 py-3 max-w-full">
           <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
            <h1 className="text-lg font-bold text-slate-800">Matownik</h1>
          </div>
          <nav className="flex gap-4">
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      <div className="md:hidden h-[64px]"></div>
    </>
  );
};

const Dashboard = () => {
  const { data } = useContext(AppContext);
  const navigate = useNavigate();

  const totalPlayers = data.people.length;
  const totalSessions = data.sessions.length;
  const totalGroups = data.groups.length;

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    navigate('/training', { state: { date: dateStr } });
  };
  
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-24 w-full overflow-x-hidden">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Dzień dobry, Trenerze! 🤼</h2>
        <p className="text-slate-500">Twoje centrum dowodzenia.</p>
      </header>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Kalendarz Aktywności</h3>
          <span className="text-xs text-slate-400">Kliknij datę, aby sprawdzić</span>
        </div>
        <CalendarView 
          currentDate={new Date()} 
          sessions={data.sessions} 
          onDateSelect={handleDateSelect}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div onClick={() => navigate('/groups')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Twoje Grupy</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalGroups}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={28} />
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-600 font-medium flex items-center">
            Zarządzaj <ChevronRight size={16} />
          </div>
        </div>

        <div onClick={() => navigate('/players')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Zawodnicy</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalPlayers}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <UserPlus size={28} />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600 font-medium flex items-center">
            Dodaj nowego <ChevronRight size={16} />
          </div>
        </div>

        <div onClick={() => navigate('/training')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Treningi</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalSessions}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Dumbbell size={28} />
            </div>
          </div>
          <div className="mt-4 text-sm text-indigo-600 font-medium flex items-center">
            Sprawdź obecność <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupManager = () => {
  const { data, updateData } = useContext(AppContext);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const addGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const newGroup: Group = { id: generateId(), name: newGroupName };
    updateData({ groups: [...data.groups, newGroup] });
    setNewGroupName('');
  };

  const startEdit = (group: Group) => {
    setEditingId(group.id);
    setEditName(group.name);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    const updatedGroups = data.groups.map(g => g.id === id ? { ...g, name: editName } : g);
    updateData({ groups: updatedGroups });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const deleteGroup = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    updateData({
      groups: data.groups.filter(g => g.id !== id),
      people: data.people.filter(p => p.groupId !== id),
      sessions: data.sessions.filter(s => s.groupId !== id),
      records: data.records.filter(r => data.sessions.find(s => s.id === r.sessionId)?.groupId !== id)
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Zarządzanie Grupami</h2>
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <form onSubmit={addGroup} className="flex flex-col md:flex-row gap-3">
          <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Nazwa nowej grupy (np. Kadra A)..." className="flex-1 px-4 py-3 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"><Plus size={20} /> Dodaj</button>
        </form>
      </div>
      <div className="space-y-3">
        {data.groups.map(group => {
          const isEditing = editingId === group.id;
          return (
            <div key={group.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              {isEditing ? (
                 <div className="flex-1 flex items-center gap-2 mr-2">
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg outline-none" autoFocus />
                    <button onClick={() => saveEdit(group.id)} className="p-2 bg-green-100 text-green-600 rounded-lg"><Save size={20} /></button>
                    <button onClick={cancelEdit} className="p-2 bg-slate-100 text-slate-600 rounded-lg"><X size={20} /></button>
                 </div>
              ) : (
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800">{group.name}</h3>
                  <p className="text-slate-500 text-sm">{data.people.filter(p => p.groupId === group.id).length} zawodników</p>
                </div>
              )}
              {!isEditing && (
                <div className="flex gap-2">
                   <button onClick={() => startEdit(group)} className="p-4 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"><Pencil size={24} /></button>
                   <button onClick={(e) => deleteGroup(e, group.id)} className="p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors active:bg-red-200"><Trash2 size={24} className="pointer-events-none" /></button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

const PlayerManager = () => {
  const { data, updateData } = useContext(AppContext);
  const [editingPlayer, setEditingPlayer] = useState<Person | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', birthYear: '', groupId: '' });
  const [filterGroupId, setFilterGroupId] = useState<string>('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;
    let targetGroupId = formData.groupId || (data.groups.length > 0 ? data.groups[0].id : '');
    if (!targetGroupId) { alert("Musisz najpierw utworzyć grupę!"); return; }
    const newPerson: Person = { id: generateId(), firstName: formData.firstName, lastName: formData.lastName, birthYear: formData.birthYear, groupId: targetGroupId };
    updateData({ people: [...data.people, newPerson] });
    setFormData({ firstName: '', lastName: '', birthYear: '', groupId: targetGroupId });
  };

  const filteredPeople = data.people.filter(p => filterGroupId === 'ALL' || p.groupId === filterGroupId);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Baza Zawodników</h2>
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><UserPlus size={20} /> Dodaj Nowego Zawodnika</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input type="text" placeholder="Imię" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="px-3 py-3 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg outline-none" required />
          <input type="text" placeholder="Nazwisko" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="px-3 py-3 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg outline-none" required />
          <input type="number" placeholder="Rocznik" value={formData.birthYear} onChange={e => setFormData({...formData, birthYear: e.target.value})} className="px-3 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg outline-none" />
          <select value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})} className="px-3 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg outline-none">
            <option value="" disabled>Wybierz grupę</option>
            {data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button type="submit" className="bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 py-3">Dodaj</button>
        </form>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4">
          <h3 className="font-bold text-slate-800">Lista ({filteredPeople.length})</h3>
          <select value={filterGroupId} onChange={(e) => setFilterGroupId(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none">
            <option value="ALL">Wszyscy</option>
            {data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredPeople.sort((a,b) => a.lastName.localeCompare(b.lastName)).map(person => (
            <div key={person.id} className="p-4 flex justify-between items-center bg-white active:bg-slate-50">
              <div>
                <div className="font-bold text-slate-900">{person.lastName} {person.firstName}</div>
                <div className="text-xs text-slate-500 mt-1">{person.birthYear || 'Rocznik brak'} • {data.groups.find(g => g.id === person.groupId)?.name}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingPlayer(person)} className="p-4 text-yellow-600 bg-yellow-50 rounded-lg"><Pencil size={24} /></button>
                <button onClick={() => updateData({ people: data.people.filter(p => p.id !== person.id) })} className="p-4 text-red-500 bg-red-50 rounded-lg"><Trash2 size={24} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editingPlayer && <EditPlayerModal person={editingPlayer} groups={data.groups} onClose={() => setEditingPlayer(null)} onSave={(up) => { updateData({ people: data.people.map(p => p.id === up.id ? up : p) }); setEditingPlayer(null); }} />}
    </div>
  );
};

const TrainingManager = () => {
  const { data, updateData } = useContext(AppContext);
  const location = useLocation();
  const [view, setView] = useState<'CALENDAR' | 'ATTENDANCE'>('CALENDAR');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [localRecords, setLocalRecords] = useState<Record<string, AttendanceStatus>>({});
  const [isCompetition, setIsCompetition] = useState(false);

  useEffect(() => { if (!selectedGroupId && data.groups.length > 0) setSelectedGroupId(data.groups[0].id); }, [data.groups]);

  useEffect(() => {
    if (location.state?.date && data.groups.length > 0) {
      const dateStr = location.state.date;
      let targetGroupId = data.groups[0].id;
      const sessionOnDate = data.sessions.find(s => s.date === dateStr);
      if (sessionOnDate) targetGroupId = sessionOnDate.groupId;
      setSelectedGroupId(targetGroupId);
      handleDateSelect(new Date(dateStr), targetGroupId);
    }
  }, [location.state, data.groups]);

  const handleDateSelect = (date: Date, groupIdOverride?: string) => {
    const groupId = groupIdOverride || selectedGroupId;
    if (!groupId) return;
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    const existing = data.sessions.find(s => s.groupId === groupId && s.date === dateStr);
    if (existing) {
      setCurrentSession(existing); setIsCompetition(existing.type === 'COMPETITION');
      const records: Record<string, AttendanceStatus> = {};
      data.people.filter(p => p.groupId === groupId).forEach(p => {
        const rec = data.records.find(r => r.sessionId === existing.id && r.personId === p.id);
        records[p.id] = rec ? rec.status : AttendanceStatus.ABSENT;
      });
      setLocalRecords(records);
    } else {
      setCurrentSession(null); setIsCompetition(false);
      const records: Record<string, AttendanceStatus> = {};
      data.people.filter(p => p.groupId === groupId).forEach(p => records[p.id] = AttendanceStatus.ABSENT);
      setLocalRecords(records);
    }
    setView('ATTENDANCE');
  };

  const save = () => {
    let sessionId = currentSession?.id || generateId();
    let newSessions = [...data.sessions];
    if (!currentSession) newSessions.push({ id: sessionId, groupId: selectedGroupId, date: selectedDate, type: isCompetition ? 'COMPETITION' : 'CLASS' });
    else { const idx = newSessions.findIndex(s => s.id === currentSession.id); if (idx > -1) newSessions[idx] = { ...newSessions[idx], type: isCompetition ? 'COMPETITION' : 'CLASS' }; }
    const recordsToAdd = Object.entries(localRecords).map(([pid, status]) => ({ id: generateId(), sessionId, personId: pid, status }));
    updateData({ sessions: newSessions, records: [...data.records.filter(r => r.sessionId !== sessionId), ...recordsToAdd] });
    setView('CALENDAR');
  };

  if (view === 'CALENDAR') {
    return (
      <div className="p-4 md:p-8 max-w-lg mx-auto pb-24 w-full">
        <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="w-full bg-white border border-slate-200 text-lg font-bold py-3 px-4 rounded-xl mb-6 shadow-sm outline-none">
          {data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <CalendarView currentDate={new Date()} sessions={data.sessions.filter(s => s.groupId === selectedGroupId)} onDateSelect={(d) => handleDateSelect(d)} />
      </div>
    );
  }

  const people = data.people.filter(p => p.groupId === selectedGroupId).sort((a, b) => a.lastName.localeCompare(b.lastName));
  const presentCount = Object.values(localRecords).filter(s => s === AttendanceStatus.PRESENT).length;

  return (
    <div className="p-4 pb-32 max-w-3xl mx-auto w-full">
       <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-50 z-20 py-2">
         <button onClick={() => setView('CALENDAR')} className="flex items-center text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200"><ChevronLeft size={20} /> Wróć</button>
         <div className="text-right"><h3 className="font-bold text-slate-800">{new Date(selectedDate).toLocaleDateString('pl-PL')}</h3><p className="text-xs text-slate-500">{data.groups.find(g=>g.id===selectedGroupId)?.name}</p></div>
       </div>
       <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex mb-6 shadow-sm">
         <button onClick={() => setIsCompetition(false)} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${!isCompetition ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-400'}`}><Dumbbell size={18} /> Trening</button>
         <button onClick={() => setIsCompetition(true)} className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${isCompetition ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-400'}`}><Trophy size={18} /> Zawody</button>
       </div>
       <div className="flex justify-between items-center px-2 mb-4"><span className="text-slate-500 font-medium">Lista obecności</span><span className="px-3 py-1 rounded-full text-sm font-bold bg-slate-200">{presentCount} / {people.length}</span></div>
       <div className="space-y-2">
         {people.map(person => {
           const isPresent = localRecords[person.id] === AttendanceStatus.PRESENT;
           return (
             <div key={person.id} onClick={() => setLocalRecords(prev => ({ ...prev, [person.id]: isPresent ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT }))} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all active:scale-[0.98] ${isPresent ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-100 border-transparent opacity-60'}`}>
                <div><p className={`font-bold text-lg ${isPresent ? 'text-slate-800' : 'text-slate-500'}`}>{person.lastName} {person.firstName}</p><p className="text-xs text-slate-400">{person.birthYear}</p></div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPresent ? 'bg-green-500 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>{isPresent ? <Check size={28} strokeWidth={3} /> : <X size={24} />}</div>
             </div>
           );
         })}
       </div>
       <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-slate-200 z-30"><button onClick={save} className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-200">Zapisz</button></div>
    </div>
  );
};

const Reports = () => {
  const { data } = useContext(AppContext);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(data.groups[0]?.id || '');
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const group = data.groups.find(g => g.id === selectedGroupId);
  const people = data.people.filter(p => p.groupId === selectedGroupId).sort((a,b) => a.lastName.localeCompare(b.lastName));
  const sessions = data.sessions.filter(s => s.groupId === selectedGroupId && s.date >= startDate && s.date <= endDate).sort((a,b) => a.date.localeCompare(b.date));

  const exportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,\ufeffNazwisko;Imię;Rocznik;" + sessions.map(s => s.date).join(";") + "\n";
    people.forEach(p => {
      let row = [p.lastName, p.firstName, p.birthYear || ''];
      sessions.forEach(s => row.push(data.records.find(r => r.sessionId === s.id && r.personId === p.id)?.status === AttendanceStatus.PRESENT ? 'X' : ''));
      csv += row.join(";") + "\n";
    });
    const link = document.createElement("a"); link.href = encodeURI(csv); link.download = `Raport_${group?.name}.csv`; link.click();
  };

  return (
    <div className="p-4 md:p-8 max-w-full mx-auto pb-24 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 no-print gap-4"><h2 className="text-2xl font-bold text-slate-800">Raporty</h2><button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-green-200"><Download size={16} /> Pobierz CSV</button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 no-print">
        <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="w-full bg-white border border-slate-200 py-3 px-4 rounded-xl shadow-sm outline-none">{data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-white border border-slate-200 py-3 px-4 rounded-xl shadow-sm outline-none" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-white border border-slate-200 py-3 px-4 rounded-xl shadow-sm outline-none" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto"><table className="w-full text-sm text-left border-collapse min-w-max"><thead><tr><th className="py-3 px-4 border-b-2 border-slate-100 bg-slate-50 font-semibold text-slate-700 sticky left-0 z-20">Zawodnik</th>{sessions.map(s => (<th key={s.id} className="px-1 border-b-2 border-slate-100 bg-slate-50 font-medium text-slate-600 text-center min-w-[36px] h-[100px] align-bottom pb-2"><div className="whitespace-nowrap -rotate-90 origin-center text-[11px] mb-2">{s.date.split('-').slice(1).reverse().join('.')}</div></th>))}<th className="py-3 px-2 border-b-2 border-slate-100 bg-slate-50 font-bold text-slate-700 text-center">%</th></tr></thead><tbody>{people.map(p => { let pres = sessions.filter(s => data.records.find(r => r.sessionId === s.id && r.personId === p.id)?.status === AttendanceStatus.PRESENT).length; return (<tr key={p.id} className="border-b border-slate-50"><td className="py-2 px-4 font-medium text-slate-900 sticky left-0 bg-white">{p.lastName} {p.firstName}</td>{sessions.map(s => (<td key={s.id} className="py-2 px-1 text-center">{data.records.find(r => r.sessionId === s.id && r.personId === p.id)?.status === AttendanceStatus.PRESENT ? <div className="w-3 h-3 bg-green-500 rounded-full mx-auto" /> : <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto" />}</td>))}<td className="py-2 px-2 text-center font-bold text-slate-700">{sessions.length > 0 ? Math.round((pres / sessions.length) * 100) : 0}%</td></tr>); })}</tbody></table></div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-24 w-full">
      <h2 className="text-2xl font-bold text-slate-800">Ustawienia i Pomoc</h2>
      
      {/* iOS Installation Instruction Card */}
      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Smartphone size={24} /> Jak zainstalować na iPhone?
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-50 font-medium">
          <li>Otwórz Matownik w przeglądarce <b>Safari</b>.</li>
          <li>Kliknij ikonę <b>Udostępnij</b> (kwadrat ze strzałką w górę) na dole ekranu.</li>
          <li>Wybierz opcję <b>Dodaj do ekranu początkowego</b>.</li>
          <li>Kliknij <b>Dodaj</b> w prawym górnym rogu.</li>
        </ol>
        <p className="mt-4 text-xs opacity-80 flex items-center gap-2 italic">
          <Info size={14} /> Od teraz Matownik będzie dostępny jako aplikacja na Twoim pulpicie!
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-2 text-slate-800">Twoje Dane</h3>
        <p className="text-sm text-slate-500 mb-4">Aplikacja działa w 100% offline. Dane są zapisywane w pamięci urządzenia.</p>
        <button onClick={() => { if (window.confirm("UWAGA: To usunie WSZYSTKIE dane. Kontynuować?")) { localStorage.clear(); window.location.reload(); } }} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16} /> Resetuj Aplikację</button>
      </div>

      <div className="text-center text-xs text-slate-400 mt-8">
        <p>Matownik v4.2 - Polska aplikacja dla trenerów 🇵🇱</p>
      </div>
    </div>
  );
};

const App = () => {
  const [data, setDataState] = useState<AppData>(loadData);
  const updateData = (newData: Partial<AppData>) => { setDataState(prev => { const next = { ...prev, ...newData }; saveData(next); return next; }); };

  return (
    <AppContext.Provider value={{ data, updateData }}>
      <HashRouter>
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto max-h-screen md:ml-64 w-full">
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
};

export default App;
