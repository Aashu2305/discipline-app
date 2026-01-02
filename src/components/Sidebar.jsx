import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
  addMonths,
  subMonths,
  subDays,
} from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { exportUserData, importUserData } from "../utils/dataPersistence";
import "./Sidebar.css";

const Sidebar = ({
  xp,
  habits,
  notes,
  reminders,
  selectedDate,
  setSelectedDate,
  isMuted,
  toggleMute,
  onImportData,
}) => {
  const [showLineChart, setShowLineChart] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // --- ADDED ONLY THIS FOR YOUR CREDIT ---
  const [showCredit, setShowCredit] = useState(false);

  // --- ONE-TIME INTRO NOTICE LOGIC (10 SEC TOTAL) ---
  useEffect(() => {
    // Flip to Bar Chart at 5 seconds
    const flipToBar = setTimeout(() => {
      setShowLineChart(false);
    }, 5000);

    // Flip back to Line Chart at 10 seconds
    const flipToLine = setTimeout(() => {
      setShowLineChart(true);
    }, 10000);

    return () => {
      clearTimeout(flipToBar);
      clearTimeout(flipToLine);
    };
  }, []); 

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // 2. PRECISION DATA FIX: Only count habits scheduled for that specific day
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayOfWeek = getDay(d);
      const dayOfMonth = parseInt(format(d, "d"));

      const completedCount = habits.filter((h) => {
        const isDone = h.completedDates && h.completedDates[dateStr] === true;
        if (!isDone) return false;

        const isHidden = h.hiddenDates?.includes(dateStr);
        if (isHidden) return false;

        if (h.type === "onetime") return h.specificDates?.includes(dateStr);
        if (h.type === "monthly") return h.targetDates?.includes(dayOfMonth);
        if (h.type === "weekly") return h.frequency?.includes(dayOfWeek);

        return true; 
      }).length;

      return {
        name: format(d, "EEE"),
        completed: completedCount,
      };
    });
  }, [habits]);

  // --- REAL-WORLD SCALING LOGIC (QUADRATIC) ---
  const currentLevel = Math.floor(Math.sqrt(xp / 200)) + 1;
  const xpStartOfLevel = Math.pow(currentLevel - 1, 2) * 200;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 200;
  
  const progressInLevel = xp - xpStartOfLevel;
  const totalRequiredForLevel = xpForNextLevel - xpStartOfLevel;
  const progressPercentage = Math.min(Math.max((progressInLevel / totalRequiredForLevel) * 100, 0), 100);

  const calendarGrid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);
    const emptySlots = Array(startDay).fill(null);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="calendar-grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="cal-header">
            {d}
          </div>
        ))}
        {emptySlots.map((_, i) => (
          <div key={`empty-${i}`} className="cal-day empty"></div>
        ))}
        {daysInMonth.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const isSelected = isSameDay(date, selectedDate);
          const dayOfWeek = getDay(date);
          const dayOfMonth = parseInt(format(date, "d"));
          const isPastMissed = date < today && !isSameDay(date, today);

          const scheduledHabits = habits.filter((h) => {
            if (h.hiddenDates?.includes(dateStr)) return false;
            if (h.type === "onetime") return h.specificDates?.includes(dateStr);
            if (h.type === "monthly")
              return h.targetDates?.includes(dayOfMonth);
            if (h.type === "weekly") return h.frequency?.includes(dayOfWeek);
            return true;
          });

          const totalScheduled = scheduledHabits.length;
          const completedCount = scheduledHabits.filter(
            (h) => h.completedDates && h.completedDates[dateStr]
          ).length;

          let bgClass = "";
          if (totalScheduled > 0) {
            const percentage = (completedCount / totalScheduled) * 100;
            if (completedCount === 0 && isPastMissed) bgClass = "cal-miss";
            else if (percentage > 0 && percentage < 40) bgClass = "cal-low";
            else if (percentage >= 40 && percentage < 100) bgClass = "cal-med";
            else if (percentage === 100) bgClass = "cal-high";
          } else if (isPastMissed) {
            bgClass = "cal-miss";
          }

          return (
            <div
              key={dateStr}
              className={`cal-day ${bgClass} ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedDate(date)}
            >
              {format(date, "d")}
            </div>
          );
        })}
      </div>
    );
  }, [habits, currentMonth, selectedDate]);

  return (
    <div className="sidebar">
      <div className="brand">
        <h1>TrackDaily.com</h1>
        {/* UPDATED ONLY THIS PART FOR THE AASHU CREDIT */}
        <div className="user-profile-container">
          <div 
            className="user-profile" 
            onClick={() => {
              setShowCredit(true);
              setTimeout(() => setShowCredit(false), 3000);
            }}
          >
            <User size={17} />
            <span>{showCredit ? "AASHU" : "User"}</span>
          </div>
          {showCredit && (
            <div className="designer-tag">
              Designed by Aashu 🔥
            </div>
          )}
        </div>
      </div>
      <div className="level-card">
        <div className="level-header">
          <Shield size={16} fill="#fbbf24" color="#fbbf24" />
          <span style={{ letterSpacing: '2px' }}>RANK: LEVEL {currentLevel}</span>
        </div>
        <div className="xp-bar-bg">
          <div className="xp-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.6rem', color: '#52525b', fontFamily: 'JetBrains Mono' }}>
          <span>{xp} XP</span>
          <span>NEXT: {xpForNextLevel} XP</span>
        </div>
      </div>
      <div className="calendar-wrapper">
        <div className="cal-nav">
          <button onClick={handlePrevMonth}>
            <ChevronLeft size={19} />
          </button>
          <span>{format(currentMonth, "MMMM yyyy")}</span>
          <button onClick={handleNextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>
        {calendarGrid}
      </div>

      <div
        className="chart-container"
        onClick={() => setShowLineChart(!showLineChart)}
        style={{ cursor: "pointer", position: "relative" }}
        title="Click to switch view"
      >
        <ResponsiveContainer width="100%" height={160}>
          {showLineChart ? (
            <LineChart
              data={last7Days}
              margin={{ top: 15, right: 20, left: 10, bottom: 0 }}
            >
              <YAxis hide={true} domain={[0, "dataMax + 1"]} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                }}
                itemStyle={{
                  color: "#22c55e",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                labelStyle={{ display: "none" }}
                formatter={(value) => [`${value} Goals`, "Hit"]}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4, fill: "#000", stroke: "#22c55e", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
            </LineChart>
          ) : (
            <BarChart
              data={last7Days}
              margin={{ top: 15, right: 20, left: 10, bottom: 0 }}
            >
              <YAxis hide={true} domain={[0, "dataMax + 1"]} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                }}
                itemStyle={{
                  color: "#fbbf24",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                labelStyle={{ display: "none" }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                formatter={(value) => [`${value} Goals`, "Hit"]}
              />
              <Bar
                dataKey="completed"
                fill="#fbbf24"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="utility-bar-container">
        <div className="utility-glass-dock">
          <button className="util-icon-btn" onClick={toggleMute}>
            {isMuted ? (
              <VolumeX size={18} color="#ef4444" />
            ) : (
              <Volume2 size={18} />
            )}
          </button>
          <div className="util-separator" />
          <button
            className="util-icon-btn"
            onClick={() => exportUserData({ habits, xp, notes, reminders })}
          >
            <Download size={18} />
          </button>
          <label className="util-icon-btn">
            <Upload size={18} />
            <input
              type="file"
              className="hidden-input"
              accept=".json"
              onChange={(e) => importUserData(e.target.files[0], onImportData)}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;