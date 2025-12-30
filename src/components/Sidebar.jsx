import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, subDays, subMonths, addMonths } from 'date-fns';
import { User, Trophy, ChevronLeft, ChevronRight, Activity, Download, Upload, Bell, List, PenTool, Clock, BarChart2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const QUOTES = [
  "Discipline is doing what needs to be done, even if you don't want to do it.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "The pain of discipline is far less than the pain of regret.",
  "Don't stop when you're tired. Stop when you're done."
];

const Sidebar = ({ xp, habits, selectedDate, setSelectedDate, setView, currentView }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [activeGraph, setActiveGraph] = useState(0); // 0 = Line, 1 = Bar
  const fileInputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setQuoteIndex(prev => (prev + 1) % QUOTES.length), 40000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveGraph(prev => (prev === 0 ? 1 : 0)), 5000);
    return () => clearInterval(interval);
  }, []);

  const level = Math.floor(xp / 100) + 1;

  // --- CHART DATA ---
  const chartData = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    let count = 0;
    habits.forEach(h => { if (h.completedDates[dateStr]) count++; });
    chartData.push({ day: format(date, 'EEE'), count });
  }

  // --- CALENDAR RENDERER ---
  const renderCalendar = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);
    const emptySlots = Array(startDay).fill(null);

    return (
      <div className="calendar-grid">
        {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="cal-header">{d}</div>)}
        {emptySlots.map((_, i) => <div key={`empty-${i}`} className="cal-day empty"></div>)}
        {daysInMonth.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isSelected = isSameDay(date, selectedDate);
          
          let completedCount = 0;
          habits.forEach(h => { if (h.completedDates[dateStr]) completedCount++; });
          
          let bgClass = "";
          if (completedCount > 0) {
             if (completedCount < 3) bgClass = "cal-low";
             else if (completedCount < 5) bgClass = "cal-med";
             else bgClass = "cal-high";
          } else if (habits.length > 0) {
             if (date < new Date() && !isSameDay(date, new Date())) bgClass = "cal-miss";
          }

          return (
            <div key={dateStr} className={`cal-day ${bgClass} ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedDate(date)}>
              {format(date, 'd')}
            </div>
          );
        })}
      </div>
    );
  };

  const handleExport = () => {
    const data = {
      habits: JSON.parse(localStorage.getItem('discipline-habits') || '[]'),
      xp: localStorage.getItem('discipline-xp') || '0',
      notes: JSON.parse(localStorage.getItem('discipline-notes') || '[]'),
      schedule: JSON.parse(localStorage.getItem('discipline-schedule') || '[]')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `discipline_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.habits && window.confirm("Overwrite current data?")) {
            localStorage.setItem('discipline-habits', JSON.stringify(data.habits));
            localStorage.setItem('discipline-xp', data.xp || '0');
            localStorage.setItem('discipline-notes', JSON.stringify(data.notes || []));
            localStorage.setItem('discipline-schedule', JSON.stringify(data.schedule || []));
            window.location.reload();
        }
      } catch (err) { alert("Error reading file."); }
    };
    reader.readAsText(file);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>DISCIPLINE.</h1>
        <div className="user-profile"><User size={16} /> <span>User</span></div>
      </div>

      <nav id="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1.5rem', marginTop: '1rem' }}>
        <button onClick={() => setView('tracker')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentView === 'tracker' ? '#27272a' : 'transparent', color: currentView === 'tracker' ? '#fff' : '#71717a', fontWeight: '600' }}>
          <List size={18} /> Tracker
        </button>
        <button onClick={() => setView('schedule')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentView === 'schedule' ? '#27272a' : 'transparent', color: currentView === 'schedule' ? '#fff' : '#71717a', fontWeight: '600' }}>
          <Clock size={18} /> Schedule
        </button>
        <button onClick={() => setView('notes')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: currentView === 'notes' ? '#27272a' : 'transparent', color: currentView === 'notes' ? '#fff' : '#71717a', fontWeight: '600' }}>
          <PenTool size={18} /> Notes
        </button>
      </nav>

      <div id="xp-card" className="level-card">
         <div className="level-header"><Trophy size={16} className="text-yellow-500" /><span>Level {level}</span></div>
         <div className="xp-bar-bg"><div className="xp-bar-fill" style={{width: `${(xp%100)}%`}}></div></div>
         <p className="xp-details">{xp % 100} / 100 XP</p>
      </div>

      <div className="motivation-panel">
        <h3>Daily Stoic</h3>
        <p className="quote-text">"{QUOTES[quoteIndex]}"</p>
        <div className="quote-timer-line"></div>
      </div>
      
      {/* ADDED ID */}
      <div id="calendar-heatmap" className="calendar-wrapper">
        <div className="cal-nav">
           <button onClick={() => setSelectedDate(subMonths(selectedDate, 1))}><ChevronLeft size={16}/></button>
           <span>{format(selectedDate, 'MMMM yyyy')}</span>
           <button onClick={() => setSelectedDate(addMonths(selectedDate, 1))}><ChevronRight size={16}/></button>
        </div>
        {renderCalendar()}
      </div>

      {/* ADDED ID */}
      <div id="stats-carousel" className="chart-section" onClick={() => setActiveGraph(prev => prev === 0 ? 1 : 0)} style={{ cursor: 'pointer', transition: 'all 0.3s' }} title="Click to switch graph">
        <div className="cal-nav">
           <span style={{display:'flex', gap:'8px', alignItems:'center'}}>
             {activeGraph === 0 ? <Activity size={16}/> : <BarChart2 size={16}/>}
             {activeGraph === 0 ? "Trend (Line)" : "Volume (Bar)"}
           </span>
        </div>
        <div style={{ width: '100%', height: 100 }}>
          <ResponsiveContainer>
            {activeGraph === 0 ? (
              <LineChart data={chartData}>
                <XAxis dataKey="day" stroke="#52525b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} cursor={{stroke: '#27272a'}} />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} dot={{r: 3, fill: '#09090b', strokeWidth: 2, stroke:'#22c55e'}} activeDot={{r: 5, fill: '#22c55e'}} />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#52525b" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeGraph === 0 ? '#fff' : '#3f3f46' }}></div>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeGraph === 1 ? '#fff' : '#3f3f46' }}></div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px' }}>
        <button onClick={handleExport} title="Backup" style={{ flex: 1, padding: '10px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#71717a', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><Download size={16} /></button>
        <button onClick={() => fileInputRef.current.click()} title="Restore" style={{ flex: 1, padding: '10px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#71717a', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><Upload size={16} /></button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleImport} />
        <button onClick={() => { Notification.requestPermission().then(perm => { if(perm === 'granted') alert("Notifications Active! 🔔"); }); }} title="Notifications" style={{ flex: 1, padding: '10px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fbbf24', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}><Bell size={16} /></button>
      </div>
    </aside>
  );
};

export default Sidebar;