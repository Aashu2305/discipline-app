import React, { useState, useEffect } from 'react';
import './App.css';
import { format, getDay, isSameDay } from 'date-fns';
import confetti from 'canvas-confetti';

import Sidebar from './components/Sidebar';
import HabitList from './components/HabitList';
import Notebook from './components/Notebook';
import Schedule from './components/Schedule'; 
import AddModal from './components/AddModal';
import DeleteModal from './components/DeleteModal';
import Tour from './components/Tour'; // IMPORT TOUR

const playNotification = () => {
  const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
  audio.volume = 0.5; audio.play().catch(e => console.log(e));
};

const playLoudRing = () => {
  const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
  audio.volume = 1.0; audio.play().catch(e => console.log(e));
};

const playPop = () => {
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
  audio.volume = 0.5; audio.play().catch(e => console.log(e));
};

function App() {
  const [view, setView] = useState('tracker');
  const [habits, setHabits] = useState(() => JSON.parse(localStorage.getItem('discipline-habits') || '[]'));
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('discipline-notes') || '[]'));
  const [reminders, setReminders] = useState(() => JSON.parse(localStorage.getItem('discipline-schedule') || '[]'));
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('discipline-xp') || '1250'));
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Modals & Tour
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [habitToDeleteId, setHabitToDeleteId] = useState(null);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    localStorage.setItem('discipline-habits', JSON.stringify(habits));
    localStorage.setItem('discipline-notes', JSON.stringify(notes));
    localStorage.setItem('discipline-schedule', JSON.stringify(reminders));
    localStorage.setItem('discipline-xp', xp.toString());
  }, [habits, notes, reminders, xp]);

  // --- TOUR CHECK ---
  useEffect(() => {
    if (!localStorage.getItem('discipline-tour-completed')) setTimeout(() => setShowTour(true), 1000);
  }, []);
  const finishTour = () => { setShowTour(false); localStorage.setItem('discipline-tour-completed', 'true'); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); };

  // --- ALARM ENGINE ---
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      const totalCurrentMinutes = (currentHour * 60) + currentMinute;

      reminders.forEach(rem => {
        let shouldTrigger = false;
        // 1. Fixed Time
        if ((!rem.type || rem.type === 'time') && rem.time === timeStr) shouldTrigger = true;
        // 2. Relative Loop
        else if (rem.type === 'interval') {
           const duration = rem.interval.totalMinutes;
           const start = rem.interval.startMins || 0;
           if (duration > 0) {
             const minutesSinceStart = (totalCurrentMinutes - start + 1440) % 1440;
             if (minutesSinceStart > 0 && minutesSinceStart % duration === 0) shouldTrigger = true;
           }
        }

        if (shouldTrigger && !rem.triggered) {
           markTriggered(rem.id);
           const doRing = rem.method === 'ring' || rem.method === 'both';
           const doNotify = rem.method === 'notify' || rem.method === 'both';

           if (doNotify && Notification.permission === 'granted') {
               playNotification(); new Notification(`Reminder: ${rem.name}`);
           }
           if (doRing) {
             playLoudRing(); setTimeout(() => alert(`⏰ ALARM: ${rem.name}`), 100);
           }
        }
      });
    };
    const timer = setInterval(checkReminders, 15000); 
    return () => clearInterval(timer);
  }, [reminders]);

  const markTriggered = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? {...r, triggered: true} : r));
    setTimeout(() => { setReminders(prev => prev.map(r => r.id === id ? {...r, triggered: false} : r)); }, 65000);
  };

  const addScheduleItem = (data) => setReminders([...reminders, { id: Date.now(), ...data, triggered: false }]);
  const deleteScheduleItem = (id) => setReminders(prev => prev.filter(r => r.id !== id));

  // --- HABIT LOGIC ---
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayOfWeekIndex = getDay(selectedDate);
  const dayOfMonth = parseInt(format(selectedDate, 'd'));
  
  const visibleHabits = habits.filter(h => {
    if (h.type === 'onetime') return h.specificDates.includes(selectedDateStr);
    if (h.type === 'monthly') return h.targetDates.includes(dayOfMonth);
    if (h.type === 'weekly') return h.frequency.includes(dayOfWeekIndex);
    return h.completedDates[selectedDateStr];
  });

  const toggleHabit = (id) => {
    playPop();
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const isDone = habit.completedDates[selectedDateStr];
        const newDates = { ...habit.completedDates };
        if (isDone) { delete newDates[selectedDateStr]; setXp(c => Math.max(0, c - 10)); } 
        else { newDates[selectedDateStr] = true; setXp(c => c + 15); }
        return { ...habit, completedDates: newDates };
      }
      return habit;
    }));
    if (isSameDay(selectedDate, new Date())) {
      const remaining = visibleHabits.filter(h => !h.completedDates[selectedDateStr] && h.id !== id).length;
      if (remaining === 0) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#22c55e', '#ffffff', '#fbbf24'] });
    }
  };

  const addNewHabit = (names, config) => { setHabits([...habits, ...names.map((n, i) => ({ id: Date.now()+i, name:n, ...config, completedDates:{} }))]); };
  const requestDelete = (id) => { setHabitToDeleteId(id); setShowDeleteModal(true); };
  const deleteForToday = () => { setHabits(prev => prev.map(h => h.id === habitToDeleteId ? null : h).filter(Boolean)); closeDeleteModal(); };
  const deleteAll = () => { setHabits(prev => prev.filter(h => h.id !== habitToDeleteId)); closeDeleteModal(); };
  const closeDeleteModal = () => { setShowDeleteModal(false); setHabitToDeleteId(null); };

  const addNote = () => setNotes([{id:Date.now(), title:"", body:"", date:format(new Date(),'MMM do')},...notes]);
  const updateNote = (id,t,b) => setNotes(prev => prev.map(n=>n.id===id?{...n,title:t,body:b}:n));
  const deleteNote = (id) => setNotes(prev => prev.filter(n=>n.id!==id));

  return (
    <div className="full-screen-layout">
      <Sidebar xp={xp} habits={habits} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setView={setView} currentView={view} />
      {view === 'tracker' || view === 'schedule' ? (
        <HabitList selectedDate={selectedDate} setSelectedDate={setSelectedDate} visibleHabits={visibleHabits} toggleHabit={toggleHabit} deleteHabit={requestDelete} openAddModal={() => setShowAddForm(true)} setView={setView} reminders={reminders} onAddSchedule={addScheduleItem} onDeleteSchedule={deleteScheduleItem}/>
      ) : (
        <Notebook notes={notes} onAdd={addNote} onDelete={deleteNote} onUpdate={updateNote} setView={setView} />
      )}
      <AddModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} onAdd={addNewHabit} />
      <DeleteModal isOpen={showDeleteModal} onClose={closeDeleteModal} onDeleteToday={deleteForToday} onDeleteAll={deleteAll} date={selectedDate} />
      {showTour && <Tour onComplete={finishTour} />}
    </div>
  );
}
export default App;