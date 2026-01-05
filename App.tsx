
import React, { useState, useEffect, useContext, createContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
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
  Pencil, 
  Save, 
  CalendarDays,
  Smartphone,
  Info
} from 'lucide-react';
import { AppData, Group, Person, Session, AttendanceStatus } from './types.ts';
import { loadData, saveData, generateId } from './services/storageService.ts';

const AppContext = createContext<{
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
}>({
  data: loadData(),
  updateData: () => {},
});

// --- Components ---

const CalendarView = ({ currentDate, onDateSelect, sessions }: any) => {
  const [viewDate, setViewDate] = useState(currentDate);
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => { let d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const startDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const monthName = viewDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  const changeMonth = (offset: number) => { const n = new Date(viewDate); n.setMonth(n.getMonth() + offset); setViewDate(n); };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft /></button>
        <h3 className="font-bold text-lg capitalize">{monthName}</h3>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
        <div>PN</div><div>WT</div><div>ŚR</div><div>CZ</div><div>PT</div><div>SO</div><div>ND</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => <div key={i} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          const hasSession = sessions.some((s: any) => s.date === dateStr);
          return (
            <div key={day} onClick={() => onDateSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))} className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer border ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
              <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>{day}</span>
              {hasSession && <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const nav = [
    { icon: BarChart3, label: 'Pulpit', path: '/' },
    { icon: Users, label: 'Grupy', path: '/groups' },
    { icon: UserPlus, label: 'Zawodnicy', path: '/players' },
    { icon: Dumbbell, label: 'Trening', path: '/training' },
    { icon: FileText, label: 'Raporty', path: '/reports' },
    { icon: Settings, label: 'Ustawienia', path: '/settings' },
  ];
  return (
    <>
      <div className="hidden md:flex w-64 bg-white border-r border-slate-200 fixed h-full flex-col z-30">
        <div className="p-6 border-b font-bold text-xl flex items-center gap-2"><div className="w-8 h-8 bg-blue-600 rounded-lg text-white flex items-center justify-center">M</div> Matownik</div>
        <nav className="p-4 space-y-2">
          {nav.map(item => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${location.pathname === item.path ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <item.icon size={20} /> {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="md:hidden fixed top-0 w-full bg-white border-b z-30 flex justify-between px-4 py-3 items-center">
        <div className="font-bold flex items-center gap-2"><div className="w-6 h-6 bg-blue-600 rounded text-white flex items-center justify-center text-xs">M</div> Matownik</div>
        <div className="flex gap-4">
          <Link to="/"><BarChart3 size={20} /></Link>
          <Link to="/reports"><FileText size={20} /></Link>
        </div>
      </div>
      <div className="md:hidden h-14" />
    </>
  );
};

const Dashboard = () => {
  const { data } = useContext(AppContext);
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h2 className="text-2xl font-bold">Dzień dobry! 🤼</h2>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-4">Kalendarz</h3>
        <CalendarView currentDate={new Date()} sessions={data.sessions} onDateSelect={(d: Date) => navigate('/training', { state: { date: d.toISOString().split('T')[0] } })} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div onClick={() => navigate('/groups')} className="bg-white p-6 rounded-xl border cursor-pointer hover:shadow-md transition-all">
          <p className="text-sm text-slate-500">Grupy</p>
          <h3 className="text-3xl font-bold">{data.groups.length}</h3>
        </div>
        <div onClick={() => navigate('/players')} className="bg-white p-6 rounded-xl border cursor-pointer hover:shadow-md transition-all">
          <p className="text-sm text-slate-500">Zawodnicy</p>
          <h3 className="text-3xl font-bold">{data.people.length}</h3>
        </div>
        <div onClick={() => navigate('/training')} className="bg-white p-6 rounded-xl border cursor-pointer hover:shadow-md transition-all">
          <p className="text-sm text-slate-500">Treningi</p>
          <h3 className="text-3xl font-bold">{data.sessions.length}</h3>
        </div>
      </div>
    </div>
  );
};

const GroupManager = () => {
  const { data, updateData } = useContext(AppContext);
  const [name, setName] = useState('');
  const add = () => { if(name) { updateData({ groups: [...data.groups, { id: generateId(), name }] }); setName(''); } };
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Grupy</h2>
      <div className="flex gap-2 mb-6"><input value={name} onChange={e => setName(e.target.value)} className="flex-1 p-3 border rounded-lg bg-slate-800 text-white" placeholder="Nazwa grupy" /><button onClick={add} className="p-3 bg-blue-600 text-white rounded-lg"><Plus /></button></div>
      <div className="space-y-2">{data.groups.map(g => (<div key={g.id} className="p-4 bg-white border rounded-xl flex justify-between items-center shadow-sm"><div><p className="font-bold">{g.name}</p><p className="text-sm text-slate-500">{data.people.filter(p=>p.groupId===g.id).length} osób</p></div><button onClick={() => updateData({ groups: data.groups.filter(x=>x.id!==g.id) })} className="text-red-500"><Trash2 size={20} /></button></div>))}</div>
    </div>
  );
};

const PlayerManager = () => {
  const { data, updateData } = useContext(AppContext);
  const [p, setP] = useState({ firstName: '', lastName: '', birthYear: '', groupId: '' });
  const add = () => { if(p.firstName && p.lastName && p.groupId) { updateData({ people: [...data.people, { ...p, id: generateId() }] }); setP({ ...p, firstName: '', lastName: '' }); } };
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Zawodnicy</h2>
      <div className="bg-white p-6 border rounded-xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={p.firstName} onChange={e=>setP({...p, firstName: e.target.value})} placeholder="Imię" className="p-3 border rounded-lg bg-slate-800 text-white" />
        <input value={p.lastName} onChange={e=>setP({...p, lastName: e.target.value})} placeholder="Nazwisko" className="p-3 border rounded-lg bg-slate-800 text-white" />
        <select value={p.groupId} onChange={e=>setP({...p, groupId: e.target.value})} className="p-3 border rounded-lg bg-slate-800 text-white"><option value="">Wybierz grupę</option>{data.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>
        <button onClick={add} className="bg-green-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"><UserPlus size={20}/> Dodaj</button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden divide-y">
        {data.people.sort((a,b)=>a.lastName.localeCompare(b.lastName)).map(x => (
          <div key={x.id} className="p-4 flex justify-between items-center">
            <div><p className="font-bold">{x.lastName} {x.firstName}</p><p className="text-sm text-slate-500">{data.groups.find(g=>g.id===x.groupId)?.name}</p></div>
            <button onClick={()=>updateData({ people: data.people.filter(y=>y.id!==x.id)})} className="text-red-400"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrainingManager = () => {
  const { data, updateData } = useContext(AppContext);
  const [groupId, setGroupId] = useState(data.groups[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('CAL');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const start = () => {
    const session = data.sessions.find(s=>s.groupId===groupId && s.date===date);
    const initial: Record<string, boolean> = {};
    data.people.filter(p=>p.groupId===groupId).forEach(p => {
      const rec = data.records.find(r=>r.sessionId===session?.id && r.personId===p.id);
      initial[p.id] = rec ? rec.status === AttendanceStatus.PRESENT : false;
    });
    setAttendance(initial);
    setView('CHECK');
  };

  const save = () => {
    let sId = data.sessions.find(s=>s.groupId===groupId && s.date===date)?.id || generateId();
    const newSessions = data.sessions.find(s=>s.id===sId) ? data.sessions : [...data.sessions, { id: sId, groupId, date, type: 'CLASS' as const }];
    const newRecords = data.records.filter(r=>r.sessionId!==sId);
    Object.entries(attendance).forEach(([pId, isP]) => {
      newRecords.push({ id: generateId(), sessionId: sId, personId: pId, status: isP ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT });
    });
    updateData({ sessions: newSessions, records: newRecords });
    setView('CAL');
  };

  if(view === 'CHECK') {
    const people = data.people.filter(p=>p.groupId===groupId).sort((a,b)=>a.lastName.localeCompare(b.lastName));
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
        <div className="flex justify-between items-center mb-6"><button onClick={()=>setView('CAL')}><ChevronLeft/></button><h3 className="font-bold">{date}</h3></div>
        <div className="space-y-2">
          {people.map(p => (
            <div key={p.id} onClick={()=>setAttendance({...attendance, [p.id]: !attendance[p.id]})} className={`p-4 border rounded-xl flex justify-between items-center transition-all ${attendance[p.id] ? 'bg-white border-green-500 shadow-sm' : 'bg-slate-100 opacity-60'}`}>
              <span className="font-bold">{p.lastName} {p.firstName}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${attendance[p.id] ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>{attendance[p.id] ? <Check size={20}/> : <X size={20}/>}</div>
            </div>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 md:pl-72 bg-white border-t"><button onClick={save} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">Zapisz obecność</button></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Trening</h2>
      <select value={groupId} onChange={e=>setGroupId(e.target.value)} className="w-full p-4 border rounded-xl mb-4 bg-white font-bold">{data.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>
      <CalendarView currentDate={new Date()} sessions={data.sessions.filter(s=>s.groupId===groupId)} onDateSelect={(d: Date) => { setDate(d.toISOString().split('T')[0]); start(); }} />
    </div>
  );
};

const Reports = () => {
  const { data } = useContext(AppContext);
  const [gId, setGId] = useState(data.groups[0]?.id || '');
  const group = data.groups.find(g=>g.id===gId);
  const people = data.people.filter(p=>p.groupId===gId).sort((a,b)=>a.lastName.localeCompare(b.lastName));
  const sessions = data.sessions.filter(s=>s.groupId===gId).sort((a,b)=>a.date.localeCompare(b.date));

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Raporty</h2>
      <select value={gId} onChange={e=>setGId(e.target.value)} className="p-3 border rounded-lg mb-6 bg-white">{data.groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 sticky left-0 bg-slate-50">Zawodnik</th>
              {sessions.map(s=><th key={s.id} className="p-2 text-center text-[10px] min-w-[40px]"><div className="-rotate-90 py-4">{s.date.split('-').slice(1).reverse().join('.')}</div></th>)}
              <th className="p-4 text-center">%</th>
            </tr>
          </thead>
          <tbody>
            {people.map(p => {
              const present = sessions.filter(s => data.records.find(r=>r.sessionId===s.id && r.personId===p.id)?.status === AttendanceStatus.PRESENT).length;
              return (
                <tr key={p.id} className="border-b">
                  <td className="p-4 font-medium sticky left-0 bg-white">{p.lastName} {p.firstName}</td>
                  {sessions.map(s => {
                    const isP = data.records.find(r=>r.sessionId===s.id && r.personId===p.id)?.status === AttendanceStatus.PRESENT;
                    return <td key={s.id} className="p-2 text-center">{isP ? <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"/> : <div className="w-1 h-1 bg-slate-200 rounded-full mx-auto"/>}</td>
                  })}
                  <td className="p-4 text-center font-bold">{sessions.length ? Math.round(present/sessions.length*100) : 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsPage = () => (
  <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
    <h2 className="text-2xl font-bold">Ustawienia</h2>
    <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Smartphone size={24} /> Instalacja iOS</h3>
      <ol className="list-decimal list-inside space-y-2 opacity-90">
        <li>Otwórz stronę w <b>Safari</b>.</li>
        <li>Kliknij ikonę <b>Udostępnij</b> (kwadrat ze strzałką).</li>
        <li>Wybierz <b>Dodaj do ekranu początkowego</b>.</li>
      </ol>
    </div>
    <div className="bg-white p-6 border rounded-xl">
      <h3 className="font-bold mb-4">Dane</h3>
      <button onClick={() => { if(confirm("Usunąć wszystko?")) { localStorage.clear(); location.reload(); }}} className="text-red-600 flex items-center gap-2"><Trash2 size={16}/> Wymaż wszystkie dane</button>
    </div>
  </div>
);

export default function App() {
  const [data, setDataState] = useState<AppData>(loadData);
  const updateData = (newData: Partial<AppData>) => {
    setDataState(prev => {
      const next = { ...prev, ...newData };
      saveData(next);
      return next;
    });
  };

  return (
    <AppContext.Provider value={{ data, updateData }}>
      <HashRouter>
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900">
          <Sidebar />
          <main className="flex-1 md:ml-64">
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
