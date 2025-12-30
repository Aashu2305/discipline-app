import React from 'react';
import { Trash2, CalendarOff, X } from 'lucide-react';
import { format } from 'date-fns';

const DeleteModal = ({ isOpen, onClose, onDeleteToday, onDeleteAll, date }) => {
  if (!isOpen) return null;

  const dayName = format(date, 'EEEE'); // e.g., "Monday"

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h3>Remove Goal</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        
        <p style={{ color: '#a1a1aa', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Do you want to remove this goal from <strong>{dayName}s</strong> only, or delete it completely from your history?
        </p>

        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {/* OPTION 1: Remove Only From This Day */}
          <button 
            onClick={onDeleteToday}
            className="day-btn" 
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '12px', border: '1px solid #27272a', background: '#09090b', color: '#fff' 
            }}
          >
            <CalendarOff size={16} />
            <span>Remove from {dayName}s only</span>
          </button>

          {/* OPTION 2: Delete Forever */}
          <button 
            onClick={onDeleteAll}
            className="save-btn" 
            style={{ 
              background: '#ef4444', color: 'white', marginTop: '5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
            }}
          >
            <Trash2 size={16} />
            <span>Delete Forever</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;