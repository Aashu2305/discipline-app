import React, { useState, useRef, useEffect } from 'react';
import { Bell, Volume2, Trash2, Clock, Plus, Timer, Hourglass } from 'lucide-react';

const Schedule = ({ reminders, onAdd, onDelete }) => {
  const [taskName, setTaskName] = useState("");
  const [type, setType] = useState("time");
  
  // Method States
  const [useNotify, setUseNotify] = useState(true);
  const [useRing, setUseRing] = useState(false);

  // Time States (12 Hour Format)
  const [timeHrs, setTimeHrs] = useState("12");
  const [timeMins, setTimeMins] = useState("00");
  const [isPm, setIsPm] = useState(false);

  // Loop States
  const [loopHrs, setLoopHrs] = useState(1);
  const [loopMins, setLoopMins] = useState(0);

  // --- LIVE COUNTDOWN STATE ---
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000); 
    return () => clearInterval(timer);
  }, []);

  // --- COUNTDOWN CALCULATOR ---
  const getCountdown = (rem) => {
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTotalMins = (currentH * 60) + currentM;

    if (rem.type === 'interval') {
       const interval = rem.interval.totalMinutes;
       const start = rem.interval.startMins || 0; 
       if (!interval || interval === 0) return "--";
       
       let diffSinceStart = (currentTotalMins - start + 1440) % 1440;
       let nextTriggerIn = interval - (diffSinceStart % interval);
       if (nextTriggerIn === interval) nextTriggerIn = 0; 

       const h = Math.floor(nextTriggerIn / 60);
       const m = nextTriggerIn % 60;
       return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
    } else {
       if (!rem.time) return "--";
       const [tH, tM] = rem.time.split(':').map(Number);
       const targetTotalMins = (tH * 60) + tM;
       
       let diff = targetTotalMins - currentTotalMins;
       if (diff <= 0) diff += 1440; 

       const h = Math.floor(diff / 60);
       const m = diff % 60;
       return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskName) return;
    
    // 1. Convert 12h to 24h
    let hours24 = parseInt(timeHrs);
    if (isPm && hours24 < 12) hours24 += 12;
    if (!isPm && hours24 === 12) hours24 = 0;
    const formattedTime = `${hours24.toString().padStart(2,'0')}:${timeMins.toString().padStart(2,'0')}`;

    if (!useNotify && !useRing) { alert("Please select at least one alert method."); return; }
    
    // 2. Loop Logic
    const currentTotalMins = (new Date().getHours() * 60) + new Date().getMinutes();
    const totalLoopMinutes = (parseInt(loopHrs) * 60) + parseInt(loopMins);
    if (type === 'interval' && totalLoopMinutes === 0) return;

    let finalMethod = 'notify';
    if (useNotify && useRing) finalMethod = 'both';
    else if (useRing) finalMethod = 'ring';
    else finalMethod = 'notify';

    onAdd({
      name: taskName, 
      method: finalMethod, 
      type, 
      time: type === 'time' ? formattedTime : null,
      interval: { hrs: loopHrs, mins: loopMins, totalMinutes: totalLoopMinutes, startMins: currentTotalMins }
    });

    setTaskName("");
  };

  const handleTimeChange = (val, setter, max, min = 0) => {
    let num = parseInt(val);
    if (isNaN(num)) num = min; 
    if (num < min) num = min;
    if (num > max) num = max;
    setter(num.toString().padStart(2, '0'));
  };

  const toggleBtnStyle = (isActive) => ({ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.2s', background: isActive ? '#fbbf24' : 'transparent', color: isActive ? '#000' : '#71717a' });
  const tumblerStyle = { background: '#18181b', border: '1px solid #3f3f46', borderRadius: '6px', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', width: '40px', padding: '6px 0', outline: 'none', appearance: 'textfield', fontFamily: 'monospace' };
  const amPmBtnStyle = (active) => ({ background: active ? '#fbbf24' : '#27272a', color: active ? '#000' : '#71717a', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' });
  const iconButtonStyle = (isActive, color) => ({ background: isActive ? `${color}20` : 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px', padding: '6px', color: isActive ? color : '#52525b', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' });

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px dashed #27272a', paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <h3 style={{ fontSize: '0.85rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={14} className="text-yellow-500"/> Schedule Center
      </h3>

      <form id="schedule-form" onSubmit={handleSubmit} style={{ background: '#09090b', padding: '0.8rem 1.2rem', borderRadius: '16px', border: '1px solid #27272a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 20px -6px rgba(0,0,0,0.6)', width: '100%', boxSizing: 'border-box' }}>
        {/* TOGGLE */}
        <div style={{ display: 'flex', background: '#18181b', borderRadius: '8px', padding: '3px', border: '1px solid #3f3f46', flexShrink: 0 }}>
          <button type="button" onClick={() => setType('time')} style={toggleBtnStyle(type === 'time')}>Time</button>
          <button type="button" onClick={() => setType('interval')} style={toggleBtnStyle(type === 'interval')}>Loop</button>
        </div>
        {/* NAME */}
        <input type="text" placeholder="Task Name..." value={taskName} onChange={(e) => setTaskName(e.target.value)} style={{ flex: 1, minWidth: '100px', background: 'transparent', border: 'none', borderBottom: '1px solid #3f3f46', color: '#fff', fontSize: '1rem', outline: 'none', paddingBottom: '4px' }}/>
        {/* INPUTS */}
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: '10px', borderRight: '1px solid #27272a' }}>
           {type === 'time' ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="number" min="1" max="12" value={timeHrs} onChange={(e) => handleTimeChange(e.target.value, setTimeHrs, 12, 1)} style={tumblerStyle} placeholder="12"/>
                <span style={{fontWeight:'bold', color:'#fbbf24', fontSize:'1.2rem', paddingBottom:'4px'}}>:</span>
                <input type="number" min="0" max="59" value={timeMins} onChange={(e) => handleTimeChange(e.target.value, setTimeMins, 59)} style={tumblerStyle} placeholder="00"/>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '4px' }}>
                  <button type="button" onClick={() => setIsPm(false)} style={amPmBtnStyle(!isPm)}>AM</button>
                  <button type="button" onClick={() => setIsPm(true)} style={amPmBtnStyle(isPm)}>PM</button>
                </div>
             </div>
           ) : (
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{position:'relative'}}><input type="number" min="0" max="23" value={loopHrs} onChange={(e) => setLoopHrs(e.target.value)} style={tumblerStyle}/><span style={{fontSize:'0.6rem', color:'#71717a', position:'absolute', bottom:'-12px', left:'50%', transform:'translateX(-50%)'}}>HR</span></div>
                <span style={{fontWeight:'bold', color:'#52525b'}}>:</span>
                <div style={{position:'relative'}}><input type="number" min="0" max="59" value={loopMins} onChange={(e) => setLoopMins(e.target.value)} style={tumblerStyle}/><span style={{fontSize:'0.6rem', color:'#71717a', position:'absolute', bottom:'-12px', left:'50%', transform:'translateX(-50%)'}}>MIN</span></div>
             </div>
           )}
        </div>
        {/* ICONS */}
        <div style={{ display: 'flex', gap: '4px', background: '#18181b', padding: '4px', borderRadius: '8px', border: '1px solid #3f3f46' }}>
           <button type="button" onClick={() => setUseNotify(!useNotify)} style={iconButtonStyle(useNotify, '#fbbf24')} title="Notification"><Bell size={18} fill={useNotify ? "#fbbf24" : "none"} /></button>
           <div style={{ width: '1px', background: '#3f3f46', margin: '2px 0' }}></div>
           <button type="button" onClick={() => setUseRing(!useRing)} style={iconButtonStyle(useRing, '#ef4444')} title="Ringtone"><Volume2 size={18} fill={useRing ? "#ef4444" : "none"} /></button>
        </div>
        {/* BTN */}
        <button type="submit" style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '0 16px', height: '40px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0, fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 0 15px rgba(255,255,255,0.1)' }}>
          <Plus size={18} strokeWidth={3} /> Set
        </button>
      </form>

      {/* LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {reminders.map(rem => (
          <div key={rem.id} style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: (rem.method === 'ring' || rem.method === 'both') ? '#ef4444' : '#fbbf24', background: (rem.method === 'ring' || rem.method === 'both') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)', padding: '6px 10px', borderRadius: '8px', fontFamily: 'monospace', minWidth: '70px', textAlign: 'center' }}>
                {rem.type === 'interval' ? <Timer size={20}/> : rem.time}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{rem.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#a1a1aa', background: '#18181b', padding: '2px 6px', borderRadius: '4px', border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Hourglass size={10} /> {getCountdown(rem)}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  {rem.type === 'interval' ? `Loop: ${rem.interval.hrs}h ${rem.interval.mins}m` : 'Fixed Alarm'}
                  <span style={{opacity: 0.3}}>|</span>
                  <div style={{display:'flex', gap:'4px'}}>
                     {(rem.method === 'notify' || rem.method === 'both') && <Bell size={12} />}
                     {(rem.method === 'ring' || rem.method === 'both') && <Volume2 size={12} />}
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => onDelete(rem.id)} style={{ background: '#7f1d1d', border: '1px solid #991b1b', color: '#fecaca', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'4px', fontSize:'0.75rem', fontWeight:'bold', transition: 'all 0.2s' }} title="Delete Alarm">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Schedule;