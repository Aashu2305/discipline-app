import React, { useState } from 'react';
import { AlertTriangle, X, Trash2, CalendarX, History, RotateCcw } from 'lucide-react';
import './DeleteModal.css';

const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onDeleteToday,    // Prop 1
  onDeleteSchedule, // Prop 2
  onDeleteForever   // Prop 3
}) => {
  const [includePast, setIncludePast] = useState(false);

  // CRASH PROTECTION: If modal isn't open, or props are missing, don't render.
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="tech-modal-box">
        <div className="modal-header">
          <div className="header-title">
            <AlertTriangle size={18} color="var(--accent)" />
            <span>PROTOCOL_TERMINATION_PROTOCOL</span>
          </div>
          <button className="close-x" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* SYSTEM OVERRIDE TOGGLE (The Past History Switch) */}
          <div className="history-toggle-box">
            <div className="toggle-label">
                <RotateCcw size={14} color={includePast ? "var(--accent)" : "#52525b"} />
                <span>WIPE_SYSTEM_HISTORY?</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={includePast} 
                onChange={() => setIncludePast(!includePast)} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="delete-options-stack">
            {/* OPTION 1: TODAY ONLY */}
            <button className="delete-opt-btn" onClick={() => onDeleteToday && onDeleteToday()}>
              <div className="opt-icon-wrap"><CalendarX size={18} /></div>
              <div className="opt-text">
                <span className="opt-title">REMOVE_FOR_TODAY</span>
                <span className="opt-sub">Hide only for this specific cycle.</span>
              </div>
            </button>

            {/* OPTION 2: SPECIFIC WEEKDAY */}
            <button className="delete-opt-btn" onClick={() => onDeleteSchedule && onDeleteSchedule(includePast)}>
              <div className="opt-icon-wrap"><History size={18} /></div>
              <div className="opt-text">
                <span className="opt-title">REMOVE_FROM_WEEKLY_CYCLE</span>
                <span className="opt-sub">Delete from every recurring day of the week.</span>
              </div>
            </button>

            {/* OPTION 3: FOREVER */}
            <button className="delete-opt-btn danger" onClick={() => onDeleteForever && onDeleteForever(includePast)}>
              <div className="opt-icon-wrap"><Trash2 size={18} /></div>
              <div className="opt-text">
                <span className="opt-title">TERMINATE_PERMANENTLY</span>
                <span className="opt-sub">Wipe protocol from the entire database.</span>
              </div>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>ABORT_TERMINATION</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;