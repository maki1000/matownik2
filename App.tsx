
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
  CalendarDays 
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
    // 0 = Sunday, 1 = Monday. We want Monday to be first cols usually in PL
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
          
          // Check sessions
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
  
  // Full list for desktop
  const desktopNavItems = [
    { icon: BarChart3, label: 'Pulpit', path: '/' },
    { icon: Users, label: 'Grupy', path: '/groups' },
    { icon: UserPlus, label: 'Zawodnicy', path: '/players' },
    { icon: Dumbbell, label: 'Trening', path: '/training' },
    { icon: FileText, label: 'Raporty', path: '/reports' },
    { icon: Settings, label: 'Ustawienia', path: '/settings' },
  ];

  // Simplified list for mobile (top bar) - ONLY Pulpit and Raporty as requested
  const mobileNavItems = [
    { icon: BarChart3, label: 'Pulpit', path: '/' },
    { icon: FileText, label: 'Raporty', path: '/reports' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
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

      {/* Mobile Top Bar */}
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
      
      {/* Spacer for Mobile Header */}
      <div className="md:hidden h-[64px]"></div>
    </>
  );
};

const Dashboard = () => {
  const { data } = React.useContext(AppContext);
  const navigate = useNavigate();

  // Calculate stats
  const totalPlayers = data.people.length;
  const totalSessions = data.sessions.length;
  const totalGroups = data.groups.length;

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Navigate to training with pre-selected date
    navigate('/training', { state: { date: dateStr } });
  };
  
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto pb-24 w-full overflow-x-hidden">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Dzień dobry, Trenerze! 🤼</h2>
        <p className="text-slate-500">Twoje centrum dowodzenia.</p>
      </header>

      {/* Calendar Activity Section moved to the top per user request */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Kalendarz Aktywności</h3>
          <span className="text-xs text-slate-400">Kliknij datę, aby sprawdzić</span>
        </div>
        <CalendarView 
          currentDate={new Date()} 
          sessions={data.sessions} // Show all sessions from all groups
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

       {/* Settings Link for Mobile (since removed from top nav) */}
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
    
    const newGroup: Group = {
      id: generateId(),
      name: newGroupName,
    };
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
    e.preventDefault();
    e.stopPropagation();
    
    const updatedGroups = data.groups.filter(g => g.id !== id);
    const updatedPeople = data.people.filter(p => p.groupId !== id);
    const updatedSessions = data.sessions.filter(s => s.groupId !== id);
    const updatedRecords = data.records.filter(r => data.sessions.find(s => s.id === r.sessionId)?.groupId !== id);

    updateData({
      groups: updatedGroups,
      people: updatedPeople,
      sessions: updatedSessions,
      records: updatedRecords
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
            placeholder="Nazwa nowej grupy (np. Kadra A)..."
            className="flex-1 px-4 py-3 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Plus size={20} /> Dodaj
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {data.groups.map(group => {
          const memberCount = data.people.filter(p => p.groupId === group.id).length;
          const isEditing = editingId === group.id;

          return (
            <div key={group.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              {isEditing ? (
                 <div className="flex-1 flex items-center gap-2 mr-2">
                    <input 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg outline-none"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(group.id)} className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <Save size={20} />
                    </button>
                    <button onClick={cancelEdit} className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                      <X size={20} />
                    </button>
                 </div>
              ) : (
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800">{group.name}</h3>
                  <p className="text-slate-500 text-sm">{memberCount} zawodników</p>
                </div>
              )}
              
              {!isEditing && (
                <div className="flex gap-2">
                   <button 
                    onClick={() => startEdit(group)}
                    className="p-4 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                    title="Edytuj grupę"
                  >
                    <Pencil size={24} />
                  </button>
                  <button 
                    onClick={(e) => deleteGroup(e, group.id)}
                    className="p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors active:bg-red-200"
                    title="Usuń grupę"
                  >
                    <Trash2 size={24} className="pointer-events-none" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {data.groups.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-slate-100 rounded-xl border-dashed border-2 border-slate-200">
            Brak grup. Dodaj pierwszą powyżej.
          </div>
        )}
      </div>
    </div>
  );
};

const PlayerManager = () => {
  const { data, updateData } = React.useContext(AppContext);
  const [editingPlayer, setEditingPlayer] = useState<Person | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthYear: '',
    groupId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    let targetGroupId = formData.groupId;
    if (!targetGroupId && data.groups.length > 0) {
      targetGroupId = data.groups[0].id;
    }
    
    if (!targetGroupId) {
      alert("Musisz najpierw utworzyć grupę!");
      return;
    }

    const newPerson: Person = {
      id: generateId(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthYear: formData.birthYear,
      groupId: targetGroupId
    };

    updateData({ people: [...data.people, newPerson] });
    setFormData({ firstName: '', lastName: '', birthYear: '', groupId: targetGroupId });
  };

  const deletePerson = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Direct delete without confirmation
    updateData({ people: data.people.filter(p => p.id !== id) });
  };

  const handleUpdatePlayer = (updatedPerson: Person) => {
    const updatedPeople = data.people.map(p => p.id === updatedPerson.id ? updatedPerson : p);
    updateData({ people: updatedPeople });
    setEditingPlayer(null);
  };

  const [filterGroupId, setFilterGroupId] = useState<string>('ALL');
  const filteredPeople = data.people.filter(p => filterGroupId === 'ALL' || p.groupId === filterGroupId);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 w-full">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Baza Zawodników</h2>

      {/* Add Player Form */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <UserPlus size={20} /> Dodaj Nowego Zawodnika
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Imię"
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-3 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="md:col-span-1">
             <input
              type="text"
              placeholder="Nazwisko"
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-3 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="md:col-span-1">
             <input
              type="number"
              placeholder="Rocznik"
              value={formData.birthYear}
              onChange={e => setFormData({...formData, birthYear: e.target.value})}
              className="w-full px-3 py-3 border border-slate-600 bg-slate-800 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-1">
            <select
              value={formData.groupId}
              onChange={e => setFormData({...formData, groupId: e.target.value})}
              className="w-full px-3 py-3 border border-slate-600 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="" disabled className="text-slate-400">Wybierz grupę</option>
              {data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors py-3">
            Dodaj
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-800 self-start md:self-center">Lista Zawodników ({filteredPeople.length})</h3>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-slate-500 whitespace-nowrap">Filtruj:</span>
            <select 
              value={filterGroupId}
              onChange={(e) => setFilterGroupId(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">Wszyscy</option>
              {data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Nazwisko i Imię</th>
                <th className="px-6 py-3">Rocznik</th>
                <th className="px-6 py-3">Grupa</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPeople
                .sort((a, b) => a.lastName.localeCompare(b.lastName))
                .map(person => {
                  const groupName = data.groups.find(g => g.id === person.groupId)?.name || '-';
                  return (
                    <tr key={person.id} className="bg-white hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-slate-900">
                        {person.lastName} {person.firstName}
                      </td>
                      <td className="px-6 py-3 text-slate-600">{person.birthYear || '-'}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {groupName}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                         <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingPlayer(person)} className="text-slate-400 hover:text-yellow-600 transition-colors p-2">
                              <Pencil size={18} />
                            </button>
                            <button onClick={(e) => deletePerson(e, person.id)} className="text-slate-400 hover:text-red-600 transition-colors p-2">
                              <Trash2 size={18} className="pointer-events-none" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredPeople.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Brak zawodników.</td></tr>
                )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden divide-y divide-slate-100">
           {filteredPeople
              .sort((a, b) => a.lastName.localeCompare(b.lastName))
              .map(person => {
                const groupName = data.groups.find(g => g.id === person.groupId)?.name || '-';
                return (
                  <div key={person.id} className="p-4 flex justify-between items-center bg-white active:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-900">{person.lastName} {person.firstName}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <span>{person.birthYear || 'Rocznik brak'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{groupName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingPlayer(person)} 
                        className="p-4 text-yellow-600 bg-yellow-50 rounded-lg active:bg-yellow-100 transition-colors"
                      >
                        <Pencil size={24} />
                      </button>
                      <button 
                        onClick={(e) => deletePerson(e, person.id)} 
                        className="p-4 text-red-500 bg-red-50 rounded-lg active:bg-red-100 transition-colors"
                      >
                        <Trash2 size={24} className="pointer-events-none" />
                      </button>
                    </div>
                  </div>
                );
              })}
            {filteredPeople.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">Brak zawodników.</div>
            )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPlayer && (
        <EditPlayerModal 
          person={editingPlayer} 
          groups={data.groups} 
          onClose={() => setEditingPlayer(null)}
          onSave={handleUpdatePlayer}
        />
      )}
    </div>
  );
};

// --- Training Logic ---

const TrainingManager = () => {
  const { data, updateData } = React.useContext(AppContext);
  const location = useLocation();
  
  // State
  const [view, setView] = useState<'CALENDAR' | 'ATTENDANCE'>('CALENDAR');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  
  // Temporary state for checking
  const [localRecords, setLocalRecords] = useState<Record<string, AttendanceStatus>>({});
  const [isCompetition, setIsCompetition] = useState(false);

  // Initialize Group - select first available if not set
  useEffect(() => {
    if (!selectedGroupId && data.groups.length > 0) {
      setSelectedGroupId(data.groups[0].id);
    }
  }, [data.groups]);

  // Handle navigation from Dashboard with pre-selected date
  useEffect(() => {
    if (location.state?.date && data.groups.length > 0) {
      const dateStr = location.state.date;
      
      // Attempt to find a group that has a session on this day, otherwise use first group
      let targetGroupId = data.groups[0].id;
      const sessionOnDate = data.sessions.find(s => s.date === dateStr);
      if (sessionOnDate) {
        targetGroupId = sessionOnDate.groupId;
      }

      setSelectedGroupId(targetGroupId);
      handleDateSelect(new Date(dateStr), targetGroupId);
      // Clear state to prevent re-triggering on re-renders if needed, though simpler to leave as is for now
    }
  }, [location.state, data.groups]);

  // Helper to trigger attendance view manually or via effect
  const handleDateSelect = (date: Date, groupIdOverride?: string) => {
    const groupId = groupIdOverride || selectedGroupId;
    if (!groupId) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    setSelectedDate(dateStr);

    // Check if session exists
    const existingSession = data.sessions.find(s => s.groupId === groupId && s.date === dateStr);
    
    if (existingSession) {
      setCurrentSession(existingSession);
      setIsCompetition(existingSession.type === 'COMPETITION');
      
      // Load records
      const records: Record<string, AttendanceStatus> = {};
      data.people.filter(p => p.groupId === groupId).forEach(p => {
        const rec = data.records.find(r => r.sessionId === existingSession.id && r.personId === p.id);
        records[p.id] = rec ? rec.status : AttendanceStatus.ABSENT;
      });
      setLocalRecords(records);
    } else {
      // New Session
      setCurrentSession(null);
      setIsCompetition(false); // Default to training
      
      // Default ALL ABSENT
      const records: Record<string, AttendanceStatus> = {};
      data.people.filter(p => p.groupId === groupId).forEach(p => {
        records[p.id] = AttendanceStatus.ABSENT;
      });
      setLocalRecords(records);
    }
    
    setView('ATTENDANCE');
  };

  const toggleAttendance = (personId: string) => {
    setLocalRecords(prev => ({
      ...prev,
      [personId]: prev[personId] === AttendanceStatus.PRESENT ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT
    }));
  };

  const save = () => {
    if (!selectedGroupId) return;

    let sessionId = currentSession?.id;
    let newSessions = [...data.sessions];
    let newRecords = [...data.records];

    if (!currentSession) {
      // Create Session
      sessionId = generateId();
      const session: Session = {
        id: sessionId,
        groupId: selectedGroupId,
        date: selectedDate,
        type: isCompetition ? 'COMPETITION' : 'CLASS'
      };
      newSessions.push(session);
    } else {
       // Update Type if changed
       const idx = newSessions.findIndex(s => s.id === currentSession.id);
       if (idx > -1) newSessions[idx] = { ...newSessions[idx], type: isCompetition ? 'COMPETITION' : 'CLASS' };
       
       // Remove old records for this session to overwrite
       newRecords = newRecords.filter(r => r.sessionId !== sessionId);
    }

    // Add records
    const recordsToAdd = Object.entries(localRecords).map(([pid, status]) => ({
      id: generateId(),
      sessionId: sessionId!,
      personId: pid,
      status: status
    }));
    
    updateData({
      sessions: newSessions,
      records: [...newRecords, ...recordsToAdd]
    });

    setView('CALENDAR');
  };

  // Guard: No Groups
  if (data.groups.length === 0) {
     return (
      <div className="p-8 text-center text-slate-500">
        <p className="mb-4">Nie masz jeszcze żadnych grup.</p>
        <Link to="/groups" className="text-blue-600 font-bold underline">Dodaj grupę</Link>
      </div>
     )
  }

  // VIEW: Calendar
  if (view === 'CALENDAR') {
    const groupSessions = data.sessions.filter(s => s.groupId === selectedGroupId);
    return (
      <div className="p-4 md:p-8 max-w-lg mx-auto pb-24 w-full">
        <div className="mb-6">
           <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Wybierz Grupę</label>
           <div className="relative">
             <select 
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-lg font-bold py-3 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
             >
               {data.groups.map(g => (
                 <option key={g.id} value={g.id}>{g.name}</option>
               ))}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
               <ChevronRight className="rotate-90" size={20} />
             </div>
           </div>
        </div>
        
        <CalendarView 
          currentDate={new Date()} 
          sessions={groupSessions}
          onDateSelect={(d) => handleDateSelect(d)}
        />
      </div>
    );
  }

  // VIEW: Attendance
  const group = data.groups.find(g => g.id === selectedGroupId);
  const people = data.people.filter(p => p.groupId === selectedGroupId).sort((a, b) => a.lastName.localeCompare(b.lastName));
  const presentCount = Object.values(localRecords).filter(s => s === AttendanceStatus.PRESENT).length;

  return (
    <div className="p-4 pb-32 max-w-3xl mx-auto w-full">
       <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-50 z-20 py-2">
         <button onClick={() => setView('CALENDAR')} className="flex items-center text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
           <ChevronLeft size={20} /> Wróć
         </button>
         <div className="text-right">
           <h3 className="font-bold text-slate-800">{new Date(selectedDate).toLocaleDateString('pl-PL')}</h3>
           <p className="text-xs text-slate-500">{group?.name}</p>
         </div>
       </div>

       {/* Toggle Type */}
       <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex mb-6">
         <button 
           onClick={() => setIsCompetition(false)}
           className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${!isCompetition ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-400'}`}
         >
           <Dumbbell size={18} /> Trening
         </button>
         <button 
           onClick={() => setIsCompetition(true)}
           className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${isCompetition ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-400'}`}
         >
           <Trophy size={18} /> Zawody
         </button>
       </div>

       {/* Stats */}
       <div className="flex justify-between items-center px-2 mb-4">
         <span className="text-slate-500 font-medium text-sm">Lista obecności</span>
         <span className={`px-3 py-1 rounded-full text-sm font-bold ${presentCount === people.length ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
           {presentCount} / {people.length}
         </span>
       </div>

       {/* List */}
       <div className="space-y-2">
         {people.map(person => {
           const isPresent = localRecords[person.id] === AttendanceStatus.PRESENT;
           return (
             <div 
               key={person.id}
               onClick={() => toggleAttendance(person.id)}
               className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all select-none active:scale-[0.98]
                 ${isPresent ? 'bg-white border-green-200 shadow-sm' : 'bg-slate-100 border-transparent opacity-60 grayscale'}
               `}
             >
                <div>
                  <p className={`font-bold text-lg ${isPresent ? 'text-slate-800' : 'text-slate-500'}`}>
                    {person.lastName} {person.firstName}
                  </p>
                  <p className="text-xs text-slate-400">{person.birthYear}</p>
                </div>
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isPresent ? 'bg-green-500 text-white shadow-md shadow-green-200 scale-100' : 'bg-slate-200 text-slate-400 scale-90'}`}>
                  {isPresent ? <Check size={28} strokeWidth={3} /> : <X size={24} />}
                </div>
             </div>
           );
         })}
         {people.length === 0 && (
           <div className="text-center py-10 text-slate-400">Brak zawodników w tej grupie.</div>
         )}
       </div>

       {/* Sticky Footer */}
       <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-slate-200 z-30 shadow-[0_-4px_6_rgba(0,0,0,0.05)]">
         <button 
           onClick={save}
           className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-200 active:bg-green-700 transition-all"
         >
           Zapisz {isCompetition ? 'Zawody' : 'Trening'}
         </button>
       </div>
    </div>
  );
};

const Reports = () => {
  const { data } = React.useContext(AppContext);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(data.groups[0]?.id || '');
  
  // Date range state
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState<string>(firstDayOfMonthStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  
  // Reset selection if groups change
  useEffect(() => {
    if (!data.groups.find(g => g.id === selectedGroupId) && data.groups.length > 0) {
      setSelectedGroupId(data.groups[0].id);
    }
  }, [data.groups]);
  
  const group = data.groups.find(g => g.id === selectedGroupId);
  const people = data.people.filter(p => p.groupId === selectedGroupId).sort((a, b) => a.lastName.localeCompare(b.lastName));
  
  // Filter sessions by group and date range
  const sessions = data.sessions
    .filter(s => {
      const matchGroup = s.groupId === selectedGroupId;
      const matchStart = !startDate || s.date >= startDate;
      const matchEnd = !endDate || s.date <= endDate;
      return matchGroup && matchStart && matchEnd;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const exportCSV = () => {
    if (!group) return;
    
    let csvContent = "data:text/csv;charset=utf-8,\ufeff"; 
    
    const headers = ["Nazwisko", "Imię", "Rocznik", ...sessions.map(s => s.date)];
    csvContent += headers.join(";") + "\n";

    people.forEach(person => {
      const row = [person.lastName, person.firstName, person.birthYear || ''];
      sessions.forEach(session => {
        const rec = data.records.find(r => r.sessionId === session.id && r.personId === person.id);
        // Change: 'X' for present, empty for absent
        const label = rec?.status === AttendanceStatus.PRESENT ? 'X' : ''; 
        row.push(label);
      });
      csvContent += row.join(";") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Raport_${group.name}_${startDate || 'poczatek'}_do_${endDate || 'dzis'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-full mx-auto pb-24 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 no-print gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Raporty</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={exportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm shadow-green-200">
             <Download size={16} /> Pobierz CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 no-print">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Wybierz grupę</label>
          <div className="relative">
            <select 
              value={selectedGroupId} 
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-800 py-3 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {data.groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
               <ChevronRight className="rotate-90" size={16} />
            </div>
          </div>
        </div>

        <div>
           <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data od</label>
           <div className="relative">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 py-3 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
           </div>
        </div>

        <div>
           <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data do</label>
           <div className="relative">
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 py-3 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
           </div>
        </div>
      </div>

      {group ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="overflow-x-auto w-full"> 
            <table className="w-full text-sm text-left border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b-2 border-slate-100 bg-slate-50 font-semibold text-slate-700 sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-bottom">
                    <div className="pb-2">Zawodnik</div>
                  </th>
                  {sessions.map(s => (
                    <th key={s.id} className="px-1 border-b-2 border-slate-100 bg-slate-50 font-medium text-slate-600 text-center min-w-[36px] h-[140px] align-bottom pb-2 relative group">
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center justify-end w-8">
                         <span className="whitespace-nowrap -rotate-90 origin-center text-[11px] mb-2 block font-mono text-slate-500">
                            {new Date(s.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
                         </span>
                         {s.type === 'COMPETITION' && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" title="Zawody"></div>}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-2 border-b-2 border-slate-100 bg-slate-50 font-bold text-slate-700 text-center min-w-[50px] align-bottom pb-4">%</th>
                </tr>
              </thead>
              <tbody>
                {people.map(person => {
                  let present = 0;
                  let total = sessions.length;

                  return (
                    <tr key={person.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 px-4 font-medium text-slate-900 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        {person.lastName} {person.firstName}
                      </td>
                      {sessions.map(session => {
                        const record = data.records.find(r => r.sessionId === session.id && r.personId === person.id);
                        const isPresent = record?.status === AttendanceStatus.PRESENT;
                        if (isPresent) present++;

                        return (
                          <td key={session.id} className="py-2 px-1 text-center">
                            {isPresent ? (
                              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
                            ) : (
                              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-auto"></div>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-center font-bold text-slate-700">
                        {total > 0 ? Math.round((present / total) * 100) : 0}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sessions.length === 0 && (
            <div className="py-12 text-center text-slate-400 bg-slate-50/50 flex flex-col items-center gap-2">
              <CalendarDays size={48} className="text-slate-200" />
              <p>Brak treningów w wybranym zakresie dat.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
          Brak grup do wyświetlenia.
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-24 w-full">
      <h2 className="text-2xl font-bold text-slate-800">Ustawienia</h2>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg mb-2 text-slate-800">Twoje Dane</h3>
        <p className="text-sm text-slate-500 mb-4">
          Aplikacja działa w 100% offline. Dane są zapisywane w pamięci Twojego telefonu/przeglądarki.
        </p>
        <button 
          onClick={() => {
            if (window.confirm("UWAGA: To usunie WSZYSTKIE dane z aplikacji (Grupy, Zawodnicy, Treningi). Kontynuować?")) {
              localStorage.clear();
              window.location.reload();
            }
          }} 
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
        >
          <Trash2 size={16} /> Resetuj Aplikację
        </button>
      </div>

      <div className="text-center text-xs text-slate-400 mt-8">
        <p>Matownik v4.0 - PWA (Zainstaluj na Androidzie)</p>
        <p>Stworzono dla polskich trenerów 🇵🇱</p>
      </div>
    </div>
  );
};

// --- Main App Container ---

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
