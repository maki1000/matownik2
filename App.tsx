
import React, { useState, useMemo, useContext } from 'react';
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
  CalendarDays,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Github
} from 'lucide-react';
import { AppData, Group, Person, Session, AttendanceStatus } from './types.ts';
import { loadData, saveData, generateId } from './services/storageService.ts';

// --- Context ---
const AppContext = React.createContext<{
  data: AppData;
  updateData: (newData: Partial<AppData>) => void;
}>({
  data: loadData(),
  updateData: () => {},
});

// --- Components ---
const CalendarView = ({ currentDate, onDateSelect, sessions }: { currentDate: Date, onDateSelect: (date: Date) => void, sessions: Session[] }) => {
  const [viewDate, setViewDate] = useState(currentDate);
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => { let d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; };
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const startDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const monthName = viewDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() - 1); setViewDate(d); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronLeft size={20} /></button>
        <h3 className="font-bold text-lg capitalize text-slate-800">{monthName}</h3>
        <button onClick={() => { const d = new Date(viewDate); d.setMonth(d.getMonth() + 1); setViewDate(d); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2 uppercase">
        <div>Pn</div><div>Wt</div><div>Śr</div><div>Cz</div><div>Pt</div><div>So</div><div>Nd</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} className="aspect-square"></div>)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          const daySessions = sessions.filter(s => s.date === dateStr);
          return (
            <div key={day} onClick={() => onDateSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))} className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
              <span className={`text-sm ${isToday ? 'font-black text-blue-600' : 'text-slate-700'}`}>{day}</span>
              <div className="flex gap-0.5 mt-0.5">
                {daySessions.map(s => <div key={s.id} className={`w-1 h-1 rounded-full ${s.type === 'CLASS' ? 'bg-green-500' : 'bg-indigo-500'}`} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"><Menu size={24} /></button>
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static h-screen`}>
        <div className="p-6"><h1 className="text-2xl font-black text-blue-600 flex items-center gap-2"><Trophy className="text-indigo-500" /> Matownik</h1><p className="text-xs text-slate-400 font-medium">Dziennik Trenera v4.9</p></div>
        <nav className="mt-4 px-4 space-y-1">
          {menuItems.map(item => (
            <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>{item.icon}<span className="font-semibold">{item.label}</span></Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

// ... Inne podstrony jak w poprzedniej wersji ...
const Dashboard = () => {
  const { data } = useContext(AppContext);
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header><h2 className="text-3xl font-bold text-slate-800">Cześć Trenerze!</h2><p className="text-slate-500">Twój klub w pigułce.</p></header>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500 text-white"><Users /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grupy</p><p className="text-2xl font-black">{data.groups.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500 text-white"><UserPlus /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zawodnicy</p><p className="text-2xl font-black">{data.people.length}</p></div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <CalendarView currentDate={new Date()} sessions={data.sessions} onDateSelect={(date) => navigate(`/training?date=${date.toISOString().split('T')[0]}`)} />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
           <h3 className="font-bold text-lg mb-4">Ostatnie treningi</h3>
           <div className="space-y-3">
             {data.sessions.slice(-3).reverse().map(s => (
               <div key={s.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                 <div><p className="font-bold text-sm">{data.groups.find(g => g.id === s.groupId)?.name}</p><p className="text-xs text-slate-400">{s.date}</p></div>
                 <ChevronRight size={16} className="text-slate-300" />
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [appData, setAppData] = useState<AppData>(loadData());
  const updateData = (newData: Partial<AppData>) => {
    setAppData(prev => {
      const updated = { ...prev, ...newData };
      saveData(updated);
      return updated;
    });
  };
  return (
    <AppContext.Provider value={{ data: appData, updateData }}>
      <HashRouter>
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 md:ml-64 w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/groups" element={<div className="p-8"><h2 className="text-2xl font-bold">Zarządzanie grupami</h2><p className="text-slate-500 mt-2">Przejdź do wersji mobilnej aby dodać grupy.</p></div>} />
              <Route path="/players" element={<div className="p-8 text-center text-slate-400">Podstrona zawodników</div>} />
              <Route path="/training" element={<div className="p-8 text-center text-slate-400">Lista treningów</div>} />
              <Route path="/reports" element={<div className="p-8 text-center text-slate-400">Raporty i PDF</div>} />
              <Route path="/settings" element={<div className="p-8"><h2 className="text-2xl font-bold">Ustawienia</h2><button onClick={() => {localStorage.clear(); window.location.reload();}} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Resetuj wszystkie dane</button></div>} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
}
