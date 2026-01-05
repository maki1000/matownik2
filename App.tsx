
import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight
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
  const { data } = React.useContext(AppContext);
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
        <div 
          onClick={() => navigate('/groups')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
        >
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

        <div 
          onClick={() => navigate('/players')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
        >
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

        <div 
           onClick={() => navigate('/training')}
           className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
        >
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

       <div className="md:hidden text-center pt-4 pb-8">
         <Link to="/settings" className="text-sm text-slate-400 hover:text-slate-600 underline">
           Przejdź do ustawień
         </Link>
       </div>
    </div>
  );
};

const GroupManager = () => {
  const { data, updateData } = React.useContext(AppContext);
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
    updateData({ groups: data.groups.map(g => g.id === id ? { ...g, name: editName } : g) });
    setEditingId(null);
  };

  const deleteGroup = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    updateData({
      groups: data.groups.filter(g => g.id !== id),
      people: data.people.filter(p => p.groupId !== id),
      sessions: data.sessions.filter(s => s.groupId !== id)
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Zarządzanie Grupami</h2>
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <form onSubmit={addGroup} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            placeholder="Nazwa nowej grupy..."
            className="flex-1 px-4 py-3 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg outline-none"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg">Dodaj</button>
        </form>
      </div>
      <div className="space-y-3">
        {data.groups.map(group => (
          <div key={group.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            {editingId === group.id ? (
              <div className="flex-1 flex gap-2"><input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 bg-slate-800 text-white p-2 rounded-lg"/><button onClick={() => saveEdit(group.id)} className="p-2 bg-green-100 text-green-600 rounded-lg"><Save size={20}/></button></div>
            ) : (
              <div className="flex-1"><h3 className="font-bold text-lg">{group.name}</h3><p className="text-slate-500 text-sm">{data.people.filter(p => p.groupId === group.id).length} zawodników</p></div>
            )}
            <div className="flex gap-2">
              <button onClick={() => startEdit(group)} className="p-4 bg-yellow-50 text-yellow-600 rounded-lg"><Pencil size={24}/></button>
              <button onClick={(e) => deleteGroup(e, group.id)} className="p-4 bg-red-50 text-red-600 rounded-lg"><Trash2 size={24}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlayerManager = () => {
  const { data, updateData } = React.useContext(AppContext);
  const [editingPlayer, setEditingPlayer] = useState<Person | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', birthYear: '', groupId: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;
    const gId = formData.groupId || (data.groups[0]?.id);
    if (!gId) return alert("Najpierw dodaj grupę!");
    updateData({ people: [...data.people, { id: generateId(), ...formData, groupId: gId }] });
    setFormData({ firstName: '', lastName: '', birthYear: '', groupId: gId });
  };

  const [filterGroupId, setFilterGroupId] = useState<string>('ALL');
  const filteredPeople = data.people.filter(p => filterGroupId === 'ALL' || p.groupId === filterGroupId);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Baza Zawodników</h2>
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input placeholder="Imię" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="px-3 py-3 bg-slate-800 text-white rounded-lg outline-none" required/>
          <input placeholder="Nazwisko" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="px-3 py-3 bg-slate-800 text-white rounded-lg outline-none" required/>
          <input type="number" placeholder="Rocznik" value={formData.birthYear} onChange={e => setFormData({...formData, birthYear: e.target.value})} className="px-3 py-3 bg-slate-800 text-white rounded-lg outline-none"/>
          <select value={formData.groupId} onChange={e => setFormData({...formData, groupId: e.target.value})} className="px-3 py-3 bg-slate-800 text-white rounded-lg outline-none">
            {data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <button type="submit" className="bg-green-600 text-white font-medium rounded-lg">Dodaj</button>
        </form>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredPeople.sort((a,b)=>a.lastName.localeCompare(b.lastName)).map(person => (
          <div key={person.id} className="p-4 flex justify-between items-center border-b last:border-0">
            <div><div className="font-bold">{person.lastName} {person.firstName}</div><div className="text-xs text-slate-500">{person.birthYear} • {data.groups.find(g=>g.id===person.groupId)?.name}</div></div>
            <div className="flex gap-2">
              <button onClick={() => setEditingPlayer(person)} className="p-3 text-yellow-600 bg-yellow-50 rounded-lg"><Pencil size={20}/></button>
              <button onClick={() => updateData({people: data.people.filter(p=>p.id!==person.id)})} className="p-3 text-red-500 bg-red-50 rounded-lg"><Trash2 size={20}/></button>
            </div>
          </div>
        ))}
      </div>
      {editingPlayer && <EditPlayerModal person={editingPlayer} groups={data.groups} onClose={()=>setEditingPlayer(null)} onSave={(upd)=> {updateData({people: data.people.map(p=>p.id===upd.id?upd:p)}); setEditingPlayer(null);}}/>}
    </div>
  );
};

const TrainingManager = () => {
  const { data, updateData } = React.useContext(AppContext);
  const location = useLocation();
  const [view, setView] = useState<'CALENDAR' | 'ATTENDANCE'>('CALENDAR');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(data.groups[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [localRecords, setLocalRecords] = useState<Record<string, AttendanceStatus>>({});
  const [isCompetition, setIsCompetition] = useState(false);

  useEffect(() => {
    if (location.state?.date && data.groups.length > 0) {
      handleDateSelect(new Date(location.state.date), selectedGroupId);
    }
  }, [location.state]);

  const handleDateSelect = (date: Date, gId = selectedGroupId) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    const sess = data.sessions.find(s => s.groupId === gId && s.date === dateStr);
    const recs: Record<string, AttendanceStatus> = {};
    data.people.filter(p => p.groupId === gId).forEach(p => {
      const r = data.records.find(re => re.sessionId === sess?.id && re.personId === p.id);
      recs[p.id] = r ? r.status : AttendanceStatus.ABSENT;
    });
    setLocalRecords(recs);
    setIsCompetition(sess?.type === 'COMPETITION');
    setView('ATTENDANCE');
  };

  if (view === 'CALENDAR') {
    return (
      <div className="p-4 md:p-8 max-w-lg mx-auto pb-24 w-full">
        <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="w-full mb-6 p-4 text-lg font-bold rounded-xl border">
          {data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <CalendarView currentDate={new Date()} sessions={data.sessions.filter(s=>s.groupId===selectedGroupId)} onDateSelect={handleDateSelect}/>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32 max-w-3xl mx-auto w-full">
      <div className="flex justify-between mb-6"><button onClick={()=>setView('CALENDAR')} className="p-2 border rounded-lg"><ChevronLeft/></button><div className="text-right"><h3 className="font-bold">{selectedDate}</h3><p className="text-xs">{data.groups.find(g=>g.id===selectedGroupId)?.name}</p></div></div>
      <div className="flex gap-2 mb-6"><button onClick={()=>setIsCompetition(false)} className={`flex-1 p-3 rounded-xl border font-bold ${!isCompetition?'bg-blue-50 text-blue-600 border-blue-200':'text-slate-400'}`}>Trening</button><button onClick={()=>setIsCompetition(true)} className={`flex-1 p-3 rounded-xl border font-bold ${isCompetition?'bg-indigo-50 text-indigo-600 border-indigo-200':'text-slate-400'}`}>Zawody</button></div>
      <div className="space-y-2">
        {data.people.filter(p=>p.groupId===selectedGroupId).sort((a,b)=>a.lastName.localeCompare(b.lastName)).map(person => {
          const isPresent = localRecords[person.id] === AttendanceStatus.PRESENT;
          return (
            <div key={person.id} onClick={() => setLocalRecords({...localRecords, [person.id]: isPresent?AttendanceStatus.ABSENT:AttendanceStatus.PRESENT})} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center ${isPresent?'bg-white border-green-200 shadow-sm':'bg-slate-100 opacity-60'}`}>
              <div className="font-bold text-lg">{person.lastName} {person.firstName}</div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPresent?'bg-green-500 text-white':'bg-slate-200 text-slate-400'}`}>{isPresent?<Check/>:<X/>}</div>
            </div>
          );
        })}
      </div>
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t"><button onClick={() => {
        const sId = generateId();
        updateData({
          sessions: [...data.sessions.filter(s=>!(s.date===selectedDate && s.groupId===selectedGroupId)), {id: sId, date: selectedDate, groupId: selectedGroupId, type: isCompetition?'COMPETITION':'CLASS'}],
          records: [...data.records.filter(r=>!data.sessions.find(s=>s.date===selectedDate && s.groupId===selectedGroupId && s.id===r.sessionId)), ...Object.entries(localRecords).map(([p,s])=>({id:generateId(),sessionId:sId,personId:p,status:s}))]
        });
        setView('CALENDAR');
      }} className="w-full p-4 bg-green-600 text-white font-bold text-lg rounded-xl">Zapisz</button></div>
    </div>
  );
};

const Reports = () => {
  const { data } = React.useContext(AppContext);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(data.groups[0]?.id || '');
  const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const sessions = data.sessions.filter(s => s.groupId === selectedGroupId && s.date >= startDate && s.date <= endDate).sort((a,b)=>a.date.localeCompare(b.date));
  const people = data.people.filter(p => p.groupId === selectedGroupId).sort((a,b)=>a.lastName.localeCompare(b.lastName));

  const exportCSV = () => {
    const group = data.groups.find(g=>g.id===selectedGroupId);
    let csv = "\ufeffNazwisko;Imię;Rocznik;" + sessions.map(s=>s.date).join(";") + "\n";
    people.forEach(p => {
      csv += `${p.lastName};${p.firstName};${p.birthYear || ""};` + sessions.map(s => data.records.find(r=>r.sessionId===s.id&&r.personId===p.id)?.status === AttendanceStatus.PRESENT ? 'X' : '').join(";") + "\n";
    });
    const link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + csv);
    link.download = `Raport_${group?.name}.csv`;
    link.click();
  };

  return (
    <div className="p-4 md:p-8 max-w-full mx-auto pb-24 w-full">
      <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Raporty</h2><button onClick={exportCSV} className="p-2 bg-green-600 text-white rounded-lg flex items-center gap-2"><Download size={16}/> CSV</button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select value={selectedGroupId} onChange={e=>setSelectedGroupId(e.target.value)} className="p-3 border rounded-xl bg-white">{data.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>
        <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="p-3 border rounded-xl bg-white"/>
        <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="p-3 border rounded-xl bg-white"/>
      </div>
      <div className="bg-white rounded-xl border overflow-x-auto"><table className="w-full text-sm text-left">
        <thead><tr className="bg-slate-50 border-b"><th className="p-4 sticky left-0 bg-slate-50 shadow-sm">Zawodnik</th>{sessions.map(s=><th key={s.id} className="p-1 text-center min-w-[30px]"><div className="rotate-[-90deg] whitespace-nowrap mb-8 mt-2 text-[10px]">{s.date.slice(5)}</div></th>)}<th className="p-2 text-center">%</th></tr></thead>
        <tbody>{people.map(p => {
          const pres = sessions.filter(s=>data.records.find(r=>r.sessionId===s.id&&r.personId===p.id)?.status===AttendanceStatus.PRESENT).length;
          return <tr key={p.id} className="border-b"><td className="p-3 font-medium sticky left-0 bg-white shadow-sm">{p.lastName} {p.firstName}</td>{sessions.map(s=><td key={s.id} className="p-1 text-center">{data.records.find(r=>r.sessionId===s.id&&r.personId===p.id)?.status===AttendanceStatus.PRESENT?<div className="w-2 h-2 bg-green-500 rounded-full mx-auto"/>:<div className="w-1 h-1 bg-slate-200 rounded-full mx-auto"/>}</td>)}<td className="p-2 text-center font-bold">{sessions.length?Math.round((pres/sessions.length)*100):0}%</td></tr>
        })}</tbody>
      </table></div>
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-24 w-full">
      <h2 className="text-2xl font-bold text-slate-800">Udostępnianie aplikacji</h2>
      
      {/* SEKCJA: INSTRUKCJA DLA CIEBIE */}
      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl border border-blue-500">
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Rocket size={24} /> Krok 1: Twoja kolej (Mac)
        </h3>
        <p className="text-sm opacity-90 mb-4">
          Zamiast wysyłać plik, musisz "postawić" aplikację w internecie. To darmowe i zajmuje 1 minutę:
        </p>
        <div className="space-y-3">
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
            <p className="text-xs font-bold mb-2">Polecana metoda (Vercel):</p>
            <ol className="list-decimal list-inside text-[11px] space-y-1 opacity-90">
              <li>Wejdź na <span className="font-bold underline">vercel.com</span> i załóż darmowe konto.</li>
              <li>Przeciągnij cały folder z projektem na stronę Vercel.</li>
              <li>Po chwili dostaniesz link typu <code className="bg-black/20 px-1">matownik.vercel.app</code>.</li>
            </ol>
          </div>
          <div className="bg-white/10 p-4 rounded-xl border border-white/20">
             <p className="text-xs font-bold mb-2">Metoda alternatywna (GitHub):</p>
             <p className="text-[11px] opacity-90">Wrzuć pliki na GitHub i włącz "GitHub Pages" w ustawieniach (Settings -> Pages).</p>
          </div>
        </div>
      </div>

      {/* SEKCJA: INSTRUKCJA DLA KOLEGI */}
      <div className="bg-white p-6 rounded-2xl border-2 border-green-500 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-[10px] font-bold">WYŚLIJ TO KOLEDZE</div>
        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-slate-800">
          <Smartphone size={24} className="text-green-500" /> Krok 2: Instrukcja dla kolegi
        </h3>
        <p className="text-sm text-slate-600 mb-6 font-medium">
           Wyślij koledze swój link (np. z Vercel) i dopisz te kroki:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2 text-sm">
              <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px]">1</div>
              Otwórz link
            </h4>
            <p className="text-[11px] text-slate-500">Otwórz adres w przeglądarce <strong>Chrome</strong> (na Androidzie) lub <strong>Safari</strong> (na iPhone).</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2 text-sm">
              <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px]">2</div>
              Zainstaluj
            </h4>
            <p className="text-[11px] text-slate-500">Kliknij <strong>3 kropki</strong> w rogu Chrome i wybierz <span className="text-green-600 font-bold">"Zainstaluj aplikację"</span>.</p>
          </div>
        </div>

        <div className="mt-6 p-3 bg-green-50 rounded-lg flex items-center gap-3">
          <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
          <p className="text-[11px] text-green-800"><strong>To wszystko!</strong> Aplikacja pojawi się na pulpicie telefonu z ikoną. Będzie działać bez internetu (offline).</p>
        </div>
      </div>

      <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-lg mb-2 text-slate-800">Resetowanie danych</h3>
        <p className="text-xs text-slate-500 mb-4">Jeśli chcesz wyczyścić bazę danych i zacząć od nowa (np. przed udostępnieniem linku):</p>
        <button onClick={() => { if(window.confirm("Czy na pewno chcesz usunąć wszystkich zawodników i historię?")) { localStorage.clear(); window.location.reload(); } }} className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"><Trash2 size={16} /> Wyczyść moją bazę danych</button>
      </div>

      <div className="text-center text-xs text-slate-400 mt-8">
        <p>Matownik v4.7 - PWA Distribution Mode</p>
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
}
