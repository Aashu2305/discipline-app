import React, { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Bell,
  Clock,
  Zap,
  Repeat,
  CalendarDays,
  Music,
  Navigation,
  Timer,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import "./HabitList.css";

const HabitList = ({
  selectedDate,
  visibleHabits,
  toggleHabit,
  deleteHabit,
  openAddModal,
  reminders,
  onAddSchedule,
  onDeleteSchedule,
}) => {
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [remName, setRemName] = useState("");
  const [remTime, setRemTime] = useState("08:00");
  const [isLoop, setIsLoop] = useState(false);
  const [loopInterval, setLoopInterval] = useState("120");
  const [method, setMethod] = useState("both");

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const completedCount = visibleHabits.filter(
    (h) => h.completedDates[dateStr]
  ).length;

  const getCountdown = (rem) => {
    const now = new Date();
    const nowTs = now.getTime();
    let diffInSeconds = 0;

    if (rem.isLoop) {
      const intervalMs = (parseInt(rem.interval) || 60) * 60 * 1000;
      const startTs = rem.createdAt || nowTs;
      const elapsed = nowTs - startTs;
      const remainingMs = intervalMs - (elapsed % intervalMs);
      diffInSeconds = Math.floor(remainingMs / 1000);
    } else {
      const [h, m] = rem.time.split(":").map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      diffInSeconds = Math.floor((target.getTime() - nowTs) / 1000);
    }

    const h = Math.floor(diffInSeconds / 3600);
    const m = Math.floor((diffInSeconds % 3600) / 60);
    const s = diffInSeconds % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
  };

  const handleAddRem = () => {
    if (!remName) return;
    onAddSchedule({
      name: remName,
      time: remTime,
      isLoop: isLoop,
      interval: loopInterval,
      method: method,
      triggered: false,
      createdAt: new Date().getTime(),
    });
    
    // RESET FORM SO NEW REMINDERS START FRESH
    setRemName("");
    setRemTime("08:00");
    setIsLoop(false);
    setLoopInterval("120");
    setMethod("both");
    setShowAddReminder(false);
  };

  return (
    <div className="habit-list-master">
      <div className="tech-section-container main-list-section">
        <div className="list-header protocol-main-header">
          <div className="header-identity-group">
            <div className="view-date-tag">
              <CalendarDays size={14} color="var(--accent)" />
              <span>
                PROTOCOLS:{" "}
                <strong>{format(selectedDate, "MMM do, yyyy")}</strong>
              </span>
              {isSameDay(selectedDate, new Date()) && (
                <span className="live-status-pill">LIVE</span>
              )}
            </div>

            <div className="header-stats-group">
              <span className="tech-label">
                <Zap size={14} /> ACTIVE ({visibleHabits.length})
              </span>
              <span className="tech-label accent-label">
                <CheckCircle2 size={14} /> DONE ({completedCount})
              </span>
            </div>
          </div>

          <button className="add-task-btn" onClick={openAddModal}>
            <Plus size={14} /> NEW_PROTOCOL
          </button>
        </div>

        <div className="habit-items-wrapper">
          {visibleHabits.length > 0 ? (
            visibleHabits.map((habit) => (
              <div
                key={habit.id}
                className={`habit-card ${
                  habit.completedDates[dateStr] ? "is-completed" : ""
                }`}
              >
                <div
                  className="habit-main"
                  onClick={() => toggleHabit(habit.id)}
                >
                  {habit.completedDates[dateStr] ? (
                    <CheckCircle2 size={22} color="#22c55e" />
                  ) : (
                    <Circle size={22} color="var(--border)" />
                  )}
                  <span className="habit-name">{habit.name}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteHabit(habit.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state-container">
              <div className="scanning-line"></div>
              <div className="empty-state-content">
                <Zap size={24} className="empty-icon" />
                <span className="empty-title">SYSTEM_STANDBY</span>
                <p className="empty-subtitle">
                  No active protocols detected for this sector. Initializing focus mode...
                </p>
                <button className="empty-add-btn" onClick={openAddModal}>
                  <Plus size={14} /> INITIALIZE_NEW_PROTOCOL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tech-section-container">
        <div className="list-header">
          <span className="tech-label">
            <Bell size={14} /> SYSTEM_REMINDERS
          </span>
          <button
            className="add-task-btn"
            onClick={() => setShowAddReminder(!showAddReminder)}
          >
            {showAddReminder ? "CANCEL" : <Plus size={14} />}
          </button>
        </div>

        {showAddReminder && (
          <div className="slim-rem-form single-line-form">
            <div className="form-settings-grid">
              <div className="setting-group">
                <span className="group-label">LABEL</span>
                <input
                  type="text"
                  className="mini-input label-input"
                  placeholder="Drink Water..."
                  value={remName}
                  onChange={(e) => setRemName(e.target.value)}
                />
              </div>
              <div className="setting-group">
                <span className="group-label">TRIGGER</span>
                <div className="chip-container">
                  <button
                    className={`chip ${!isLoop ? "active" : ""}`}
                    onClick={() => setIsLoop(false)}
                  >
                    FIXED
                  </button>
                  <button
                    className={`chip ${isLoop ? "active" : ""}`}
                    onClick={() => setIsLoop(true)}
                  >
                    LOOP
                  </button>
                </div>
              </div>
              <div className="setting-group">
                <span className="group-label">{isLoop ? "MINS" : "TIME"}</span>
                {isLoop ? (
                  <input
                    type="number"
                    className="mini-input"
                    value={loopInterval}
                    onChange={(e) => setLoopInterval(e.target.value)}
                  />
                ) : (
                  <input
                    type="time"
                    className="mini-input"
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                  />
                )}
              </div>
              <div className="setting-group">
                <span className="group-label">METHOD</span>
                <div className="chip-container">
                  <button
                    className={`chip ${method === "ring" ? "active" : ""}`}
                    onClick={() => setMethod("ring")}
                  >
                    <Music size={12} />
                  </button>
                  <button
                    className={`chip ${method === "notify" ? "active" : ""}`}
                    onClick={() => setMethod("notify")}
                  >
                    <Navigation size={12} />
                  </button>
                  <button
                    className={`chip ${method === "both" ? "active" : ""}`}
                    onClick={() => setMethod("both")}
                  >
                    BOTH
                  </button>
                </div>
              </div>
              <div className="setting-group">
                <span className="group-label" style={{ opacity: 0 }}>
                  _
                </span>
                <button className="deploy-btn-compact" onClick={handleAddRem}>
                  DEPLOY
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="reminders-grid">
          {reminders.map((rem) => (
            <div key={rem.id} className="rem-card">
              <div className="rem-info">
                {rem.isLoop ? (
                  <Repeat size={14} color="var(--accent)" />
                ) : (
                  <Clock size={14} color="var(--accent)" />
                )}
                <div className="rem-meta">
                  <span className="rem-name">{rem.name}</span>
                  <span className="rem-type-label">
                    {rem.isLoop ? `${rem.interval}m` : rem.time} • {rem.method}
                  </span>
                </div>
              </div>
              <div className="rem-timer-box">
                <Timer size={12} />
                <span>T-{getCountdown(rem)}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => onDeleteSchedule(rem.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitList;