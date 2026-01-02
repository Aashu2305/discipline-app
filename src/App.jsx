import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./App.css";
import { format, getDay, addDays, addWeeks } from "date-fns";
import Sidebar from "./components/Sidebar";
import HabitList from "./components/HabitList";
import AddModal from "./components/AddModal";
import DeleteModal from "./components/DeleteModal";
// --- NEW IMPORT ---
import TimeCenter from "./components/TimeCenter";

// --- MOTIVATIONAL QUOTES DATA (30 QUOTES) ---
const MOTIVATIONAL_QUOTES = [
  "Discipline is choosing what you want most over what you want now.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Don't stop when you're tired. Stop when you're done.",
  "The only bad workout is the one that didn't happen.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "Your mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.",
  "Hard work beats talent when talent doesn't work hard.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Consistency is the bridge between goals and accomplishment.",
  "Don't wish it were easier, wish you were better.",
  "If you want something you've never had, you must be willing to do something you've never done.",
  "The difference between who you are and who you want to be is what you do.",
  "Great things never come from comfort zones.",
  "Stay focused, stay humble, always hustle.",
  "Win the morning, win the day.",
  "You don't have to be great to start, but you have to start to be great.",
  "The vision that you glorify in your mind, the ideal that you enthrone in your heart, this you will build your life by.",
  "Small daily improvements over time lead to stunning results.",
  "Your future is created by what you do today, not tomorrow.",
  "Self-discipline is the only power which can make you invincible.",
  "Be stronger than your strongest excuse.",
  "Action is the foundational key to all success.",
  "It does not matter how slowly you go as long as you do not stop.",
  "The successful warrior is the average man, with laser-like focus.",
  "Discipline is the soul of an army. It makes small numbers formidable.",
  "Everything you've ever wanted is on the other side of fear.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Results happen over time, not overnight. Work hard, stay consistent, and be patient.",
  "Obsessed is just a word the lazy use to describe the dedicated.",
  "Don't count the days, make the days count."
];

function App() {
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem("discipline-muted") === "true");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView] = useState("tracker");

  const [habits, setHabits] = useState(() => JSON.parse(localStorage.getItem("discipline-habits") || "[]"));
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem("discipline-notes") || "[]"));
  const [reminders, setReminders] = useState(() => JSON.parse(localStorage.getItem("discipline-schedule") || "[]"));
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("discipline-xp") || "1250"));
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [habitToDeleteId, setHabitToDeleteId] = useState(null);
  
  // --- NEW STATE FOR TIME CENTER ---
  const [showTimeCenter, setShowTimeCenter] = useState(false);

  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  
  // Audio reference to stop sound instantly
  const audioRef = useRef(null);

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 60000);
    return () => { clearInterval(clockTimer); clearInterval(quoteTimer); };
  }, []);

  useEffect(() => {
    localStorage.setItem("discipline-habits", JSON.stringify(habits));
    localStorage.setItem("discipline-notes", JSON.stringify(notes));
    localStorage.setItem("discipline-schedule", JSON.stringify(reminders));
    localStorage.setItem("discipline-xp", xp.toString());
    localStorage.setItem("discipline-muted", isMuted);
  }, [habits, notes, reminders, xp, isMuted]);

  // --- FIXED ALARM ENGINE ---
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const nowTs = now.getTime();
      
      reminders.forEach((rem) => {
        let shouldTrigger = false;
        if (rem.isLoop) {
          const intervalMs = (parseInt(rem.interval) || 60) * 60 * 1000;
          const startTs = rem.createdAt || nowTs;
          const elapsed = nowTs - startTs;
          if (elapsed > 0 && Math.floor(elapsed % intervalMs) < 1000 && !rem.triggered)
            shouldTrigger = true;
        } else {
          const [h, m] = rem.time.split(":").map(Number);
          const alarmDate = new Date();
          alarmDate.setHours(h, m, 0, 0);
          if (Math.abs(nowTs - alarmDate.getTime()) < 1000 && !rem.triggered)
            shouldTrigger = true;
        }

        if (shouldTrigger) {
          markTriggered(rem.id);
          if (!isMuted) {
            const url = (rem.method === "ring" || rem.method === "both")
              ? "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
              : "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
            
            audioRef.current = new Audio(url);
            if (rem.method === "ring" || rem.method === "both") audioRef.current.loop = true;
            audioRef.current.play().catch(e => console.log(e));
          }
          
          setTimeout(() => {
            alert(`⏰ ALARM: ${rem.name}`);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }, 100);
        }
      });
    };
    
    const timer = setInterval(checkReminders, 1000); 
    return () => clearInterval(timer);
  }, [reminders, isMuted]);

  const markTriggered = (id) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, triggered: true } : r)));
    setTimeout(() => {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, triggered: false } : r)));
    }, 2000); 
  };

  const visibleHabits = useMemo(() => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const dayOfWeekIndex = getDay(selectedDate);
    const dayOfMonth = parseInt(format(selectedDate, "d"));
    return habits.filter((h) => {
      if (h.hiddenDates?.includes(selectedDateStr)) return false;
      if (h.type === "onetime") return h.specificDates?.includes(selectedDateStr);
      if (h.type === "monthly") return h.targetDates?.includes(dayOfMonth);
      if (h.type === "weekly") return h.frequency?.includes(dayOfWeekIndex);
      return true;
    });
  }, [habits, selectedDate]);

  const toggleHabit = useCallback((id) => {
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
      setHabits((prev) => prev.map((h) => {
          if (h.id === id) {
            const newDates = { ...h.completedDates };
            if (newDates[selectedDateStr]) {
              delete newDates[selectedDateStr];
              setXp((x) => x - 10);
            } else {
              newDates[selectedDateStr] = true;
              setXp((x) => x + 15);
            }
            return { ...h, completedDates: newDates };
          }
          return h;
        })
      );
    }, [selectedDate]);

  const addNewHabit = (names, config, applyToPast) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newHabits = names.map((n, i) => {
      let hiddenDates = [];
      if (!applyToPast) {
        for (let j = 1; j <= 365; j++)
          hiddenDates.push(format(addDays(today, -j), "yyyy-MM-dd"));
      }
      return { id: Date.now() + i + Math.random(), name: n, ...config, completedDates: {}, hiddenDates };
    });
    setHabits([...habits, ...newHabits]);
    setShowAddForm(false);
  };

  const deleteForTodayOnly = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setHabits(prev => prev.map(h => h.id === habitToDeleteId ? { ...h, hiddenDates: [...(h.hiddenDates || []), dateStr] } : h));
    setShowDeleteModal(false);
  };

  const deleteFromEveryWeekDay = (wipePast) => {
    const dayIndex = getDay(selectedDate);
    setHabits(prev => prev.map(h => {
      if (h.id === habitToDeleteId) {
        if (wipePast) return { ...h, frequency: h.frequency.filter(d => d !== dayIndex), completedDates: {} };
        const newHidden = [...(h.hiddenDates || [])];
        let scanDate = new Date(selectedDate);
        for (let i = 0; i < 104; i++) {
          const fDate = format(scanDate, 'yyyy-MM-dd');
          if (!newHidden.includes(fDate)) newHidden.push(fDate);
          scanDate = addWeeks(scanDate, 1);
        }
        return { ...h, hiddenDates: newHidden };
      }
      return h;
    }));
    setShowDeleteModal(false);
  };

  const deleteForever = (wipePast) => {
    if (wipePast) setHabits(prev => prev.filter(h => h.id !== habitToDeleteId));
    else {
      setHabits(prev => prev.map(h => {
        if (h.id === habitToDeleteId) {
          const newHidden = [...(h.hiddenDates || [])];
          let scanDate = new Date(selectedDate);
          for (let i = 0; i < 730; i++) {
            const dStr = format(scanDate, 'yyyy-MM-dd');
            if (!newHidden.includes(dStr)) newHidden.push(dStr);
            scanDate = addDays(scanDate, 1);
          }
          return { ...h, hiddenDates: newHidden };
        }
        return h;
      }));
    }
    setShowDeleteModal(false);
  };

  return (
    <div className="full-screen-layout">
      <Sidebar
        xp={xp} habits={habits} notes={notes} reminders={reminders}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        setView={setView} currentView={view} isMuted={isMuted}
        toggleMute={() => setIsMuted(!isMuted)}
        onImportData={(data) => { setHabits(data.habits); setXp(data.xp); }}
      />
      <div className="main-content-area">
        <header className="tech-header">
          <div className="tech-header-content">
            <div className="tech-quote-box">
              <span className="tech-label">PROTOCOL_STATUS: ACTIVE</span>
              <h2 className="tech-quote">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</h2>
            </div>
            
            {/* ADDED onClick HERE TO OPEN TIME CENTER */}
            <div className="tech-date-box" onClick={() => setShowTimeCenter(true)} style={{ cursor: "pointer" }}>
              <div className="tech-time-wrapper">
                <span className="tech-label">TIME</span>
                <div className="tech-time">{format(currentTime, "HH:mm:ss")}</div>
              </div>
              <div className="tech-date-wrapper">
                <span className="tech-label">DATE</span>
                <div className="tech-date">{format(currentTime, "EEEE, MMMM do")}</div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="scrollable-content">
          <HabitList
            selectedDate={selectedDate}
            visibleHabits={visibleHabits}
            toggleHabit={toggleHabit}
            deleteHabit={(id) => { setHabitToDeleteId(id); setShowDeleteModal(true); }}
            openAddModal={() => setShowAddForm(true)}
            reminders={reminders}
            onAddSchedule={(d) => setReminders([...reminders, { id: Date.now(), ...d, triggered: false }])}
            onDeleteSchedule={(id) => {
               if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
               setReminders(reminders.filter((r) => r.id !== id));
            }}
          />
        </div>
      </div>
      
      {showAddForm && <AddModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} onAdd={addNewHabit} />}
      
      {/* RENDER THE TIME CENTER MODAL */}
      {showTimeCenter && <TimeCenter onClose={() => setShowTimeCenter(false)} />}
      
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleteToday={deleteForTodayOnly}
        onDeleteSchedule={deleteFromEveryWeekDay}
        onDeleteForever={deleteForever}
      />
    </div>
  );
}
export default App;