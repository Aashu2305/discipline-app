import React, { useState, useEffect } from 'react'; 
import { X, Calendar, CalendarDays, Clock, Plus, History } from 'lucide-react';
import { format } from 'date-fns';
import './Modal.css';

const AddModal = ({ isOpen, onClose, onAdd }) => {
  const [habitInput, setHabitInput] = useState("");
  const [mode, setMode] = useState('weekly'); // 'weekly', 'monthly', 'onetime'
  const [applyToPast, setApplyToPast] = useState(false); // NEW: History Toggle State
  
  // Selection States
  const [selectedDays, setSelectedDays] = useState([0,1,2,3,4,5,6]); 
  const [selectedDates, setSelectedDates] = useState([1]); 
  const [specificDates, setSpecificDates] = useState([]); 
  const [tempDate, setTempDate] = useState(""); 

  useEffect(() => {
    if (isOpen) {
      setHabitInput("");
      setMode('weekly');
      setApplyToPast(false); // Default to FALSE to keep past clean
      setSelectedDays([0,1,2,3,4,5,6]);
      setSelectedDates([1]);
      setSpecificDates([format(new Date(), 'yyyy-MM-dd')]);
      setTempDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!habitInput.trim()) return;
    
    const names = habitInput.split('\n').filter(n => n.trim().length > 0);

    const config = {
      type: mode,
      frequency: mode === 'weekly' ? (selectedDays.length === 0 ? [0,1,2,3,4,5,6] : selectedDays) : [],
      targetDates: mode === 'monthly' ? (selectedDates.length === 0 ? [1] : selectedDates) : [],
      specificDates: mode === 'onetime' ? specificDates : []
    };

    // We pass the applyToPast flag as the 3rd argument to our App.jsx function
    onAdd(names, config, applyToPast);
    onClose();
  };

  // --- TOGGLES ---
  const toggleDaySelection = (dayIndex) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const toggleDateSelection = (dateNum) => {
    if (selectedDates.includes(dateNum)) {
      setSelectedDates(selectedDates.filter(d => d !== dateNum));
    } else {
      setSelectedDates([...selectedDates, dateNum].sort((a,b) => a - b));
    }
  };

  const addSpecificDate = () => {
    if (tempDate && !specificDates.includes(tempDate)) {
      setSpecificDates([...specificDates, tempDate].sort());
    }
  };

  const removeSpecificDate = (dateStr) => {
    setSpecificDates(specificDates.filter(d => d !== dateStr));
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '500px' }}>
        <div className="modal-header">
          <h3>Add Goals</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Goal Names (One per line)</label>
          <textarea 
            autoFocus
            placeholder="Read 10 pages&#10;Drink 3L Water&#10;No Sugar" 
            value={habitInput}
            onChange={(e) => setHabitInput(e.target.value)}
            style={{
              width: '100%', height: '80px', background: '#09090b', border: '1px solid #3f3f46',
              color: '#fff', padding: '1rem', borderRadius: '8px', fontSize: '1rem', outline: 'none',
              marginBottom: '1.5rem', resize: 'none', fontFamily: 'Inter, sans-serif'
            }}
          />

          {/* MODE TOGGLE */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: '#09090b', padding: '4px', borderRadius: '8px', border: '1px solid #27272a' }}>
            {['weekly', 'monthly', 'onetime'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: mode === m ? '#27272a' : 'transparent',
                  color: mode === m ? '#fff' : '#71717a', fontWeight: mode === m ? 'bold' : 'normal',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem',
                  textTransform: 'capitalize'
                }}
              >
                {m === 'weekly' && <CalendarDays size={14}/>}
                {m === 'monthly' && <Calendar size={14}/>}
                {m === 'onetime' && <Clock size={14}/>}
                {m === 'onetime' ? 'One-Time' : m}
              </button>
            ))}
          </div>
          
          {/* OPTION SELECTIONS REMAIN SAME */}
          {mode === 'weekly' && (
            <div className="day-selector">
              {['S','M','T','W','T','F','S'].map((day, idx) => (
                <button 
                  key={idx} type="button"
                  className={`day-btn ${selectedDays.includes(idx) ? 'active' : ''}`}
                  onClick={() => toggleDaySelection(idx)}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          {mode === 'monthly' && (
            <div style={{ marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {Array.from({length: 31}, (_, i) => i + 1).map(num => (
                  <button
                    key={num} type="button" onClick={() => toggleDateSelection(num)}
                    style={{
                      padding: '8px 0', borderRadius: '4px', border: '1px solid #27272a', cursor: 'pointer',
                      fontSize: '0.85rem', background: selectedDates.includes(num) ? '#22c55e' : '#09090b',
                      color: selectedDates.includes(num) ? '#000' : '#a1a1aa'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'onetime' && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="date" 
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  style={{ flex: 1, background: '#09090b', border: '1px solid #3f3f46', color: '#fff', padding: '8px', borderRadius: '6px' }}
                />
                <button 
                  type="button" onClick={addSpecificDate}
                  style={{ background: '#27272a', color: '#fff', border: 'none', padding: '0 12px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <Plus size={18}/>
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {specificDates.map(date => (
                  <span key={date} style={{ background: '#27272a', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {date}
                    <button type="button" onClick={() => removeSpecificDate(date)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={12}/></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* --- THE HISTORY TOGGLE SECTION --- */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 15px', background: 'rgba(251, 191, 36, 0.05)',
            border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px', marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', fontWeight: '800', color: applyToPast ? '#fff' : '#71717a' }}>
                <History size={14} color={applyToPast ? "#fbbf24" : "#52525b"} />
                <span>APPLY_TO_PAST_HISTORY?</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={applyToPast} 
                onChange={() => setApplyToPast(!applyToPast)} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          <button type="submit" className="save-btn">Create {habitInput.split('\n').filter(n=>n.trim()).length > 1 ? 'Goals' : 'Goal'}</button>
        </form>
      </div>
    </div>
  );
};

export default AddModal;