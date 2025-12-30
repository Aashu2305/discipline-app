import React from 'react';
import { format, addDays, subDays } from 'date-fns';
import { CheckCircle, Plus, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Schedule from './Schedule';

const HabitList = ({ 
  selectedDate, setSelectedDate, visibleHabits, toggleHabit, deleteHabit, openAddModal, setView,
  reminders, onAddSchedule, onDeleteSchedule 
}) => {
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'hidden' }}>
      <header className="top-bar" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '6px', textDecorationColor: '#22c55e' }}>Tracker</button>
          <div style={{ width: '1px', height: '20px', background: '#27272a' }}></div>
          <button onClick={() => setView('notes')} style={{ background: 'transparent', color: '#71717a', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>Notes</button>
        </div>
        <div className="date-display" style={{ transform: 'scale(0.9)' }}>
          <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="nav-btn"><ChevronLeft size={16}/></button>
          <div className="current-date" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.2rem' }}>{format(selectedDate, 'MMM do')}</h2>
          </div>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="nav-btn"><ChevronRight size={16}/></button>
        </div>
        <button className="add-btn-primary" onClick={openAddModal}><Plus size={18} /> Add Goal</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
        
        {/* ID FOR TOUR */}
        <div id="daily-goals" className="habits-container">
          {visibleHabits.length === 0 ? (
            <div className="empty-state">
              <CalendarIcon size={48} className="text-muted" />
              <p>No goals set for today.</p>
            </div>
          ) : (
            visibleHabits.map(habit => {
              const isDone = habit.completedDates[selectedDateStr];
              return (
                <div key={habit.id} className={`habit-card ${isDone ? 'done' : ''}`} onClick={() => toggleHabit(habit.id)}>
                   <div className="habit-content">
                     <div className={`checkbox-lg ${isDone ? 'checked' : ''}`}>
                       {isDone && <CheckCircle size={24} color="#000" />}
                     </div>
                     <span className="habit-title">{habit.name}</span>
                   </div>
                   <button className="delete-icon" onClick={(e) => {e.stopPropagation(); deleteHabit(habit.id)}}>
                     <Trash2 size={16} />
                   </button>
                </div>
              )
            })
          )}
        </div>

        {/* ID FOR TOUR */}
        <div id="schedule-section">
          <Schedule 
            reminders={reminders} 
            onAdd={onAddSchedule} 
            onDelete={onDeleteSchedule} 
          />
        </div>
        
      </div>
    </main>
  );
};

export default HabitList;