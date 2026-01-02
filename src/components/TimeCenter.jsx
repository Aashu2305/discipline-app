import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Clock, Zap, X, Maximize, Minimize } from 'lucide-react';
import { format } from "date-fns";
import './TimeCenter.css';

const TimeCenter = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('stopwatch'); 
  const [isFull, setIsFull] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);
  
  const [swTime, setSwTime] = useState(0);
  const [swActive, setSwActive] = useState(false);
  
  const [tmHours, setTmHours] = useState(0);
  const [tmMins, setTmMins] = useState(45);
  const [tmSecs, setTmSecs] = useState(0);
  const [tmTotalSeconds, setTmTotalSeconds] = useState(2700);
  const [tmActive, setTmActive] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const modalRef = useRef(null);
  const audioRef = useRef(new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"));

  const toggleFullScreen = () => {
    if (!isFull) {
      if (modalRef.current.requestFullscreen) modalRef.current.requestFullscreen();
      setIsFull(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFull(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('tc-overlay')) onClose();
  };

  useEffect(() => {
    let interval = null;
    if (swActive) interval = setInterval(() => setSwTime(prev => prev + 10), 10);
    return () => clearInterval(interval);
  }, [swActive]);

  useEffect(() => {
    let interval = null;
    if (tmActive && tmTotalSeconds > 0) {
      interval = setInterval(() => setTmTotalSeconds(prev => prev - 1), 1000);
    } else if (tmTotalSeconds === 0 && tmActive) {
      setTmActive(false);
      audioRef.current.play();
      alert("SESSION_COMPLETE");
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    return () => clearInterval(interval);
  }, [tmActive, tmTotalSeconds]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSw = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const centi = Math.floor((ms % 1000) / 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${centi.toString().padStart(2, '0')}`;
  };

  const formatTm = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="tc-overlay" onClick={handleOverlayClick}>
      <div className={`tc-container ${isFull ? 'is-full-screen' : ''}`} ref={modalRef}>
        
        <div className="tc-nav-top">
           <button onClick={toggleFullScreen} className="tc-ghost-btn">
             {isFull ? <Minimize size={28} /> : <Maximize size={24} />}
           </button>
           {!isFull && <button onClick={onClose} className="tc-ghost-btn"><X size={32} /></button>}
        </div>

        <div className="tc-main-content">
          <div className="tc-tabs-minimal">
            <button className={activeTab === 'stopwatch' ? 'active' : ''} onClick={() => setActiveTab('stopwatch')}>STOPWATCH</button>
            <button className={activeTab === 'timer' ? 'active' : ''} onClick={() => setActiveTab('timer')}>TIMER</button>
            <button className={activeTab === 'clock' ? 'active' : ''} onClick={() => setActiveTab('clock')}>CLOCK</button>
          </div>

          <div className="tc-center-stage">
            {activeTab === 'stopwatch' && (
              <div className="tc-flex-col">
                <div className="tc-digital-readout">{formatSw(swTime)}</div>
                <div className="tc-controls-minimal">
                  <button className="tc-main-action" onClick={() => setSwActive(!swActive)}>{swActive ? <Pause size={30}/> : <Play size={30}/>}</button>
                  <button className="tc-sub-action" onClick={() => {setSwActive(false); setSwTime(0);}}><RotateCcw size={20}/></button>
                </div>
              </div>
            )}

            {activeTab === 'timer' && (
              <div className="tc-flex-col">
                <div className="tc-digital-readout">{formatTm(tmTotalSeconds)}</div>
                
                {!tmActive && (
                  <div className="tc-custom-input-box">
                    <div className="input-field">
                      <input type="number" value={tmHours} onChange={(e) => setTmHours(e.target.value)} />
                      <span>H</span>
                    </div>
                    <div className="input-field">
                      <input type="number" value={tmMins} onChange={(e) => setTmMins(e.target.value)} />
                      <span>M</span>
                    </div>
                    <div className="input-field">
                      <input type="number" value={tmSecs} onChange={(e) => setTmSecs(e.target.value)} />
                      <span>S</span>
                    </div>
                    <button className="tc-set-btn" onClick={() => setTmTotalSeconds((parseInt(tmHours)*3600)+(parseInt(tmMins)*60)+parseInt(tmSecs))}>SET_PROTOCOL</button>
                  </div>
                )}

                <div className="tc-controls-minimal">
                  <button className="tc-main-action" onClick={() => setTmActive(!tmActive)}>{tmActive ? <Pause size={30}/> : <Play size={30}/>}</button>
                  <button className="tc-sub-action" onClick={() => {setTmActive(false); setTmTotalSeconds(2700);}}><RotateCcw size={20}/></button>
                </div>
              </div>
            )}

            {activeTab === 'clock' && (
              <div className="tc-flex-col clock-container">
                <div className="tc-digital-readout tc-yellow-glow">
                  {format(currentTime, showSeconds ? "HH:mm:ss" : "HH:mm")}
                </div>
                <div className="clock-stealth-toggle">
                   <button onClick={() => setShowSeconds(!showSeconds)}>
                     {showSeconds ? "HIDE_SECONDS" : "SHOW_SECONDS"}
                   </button>
                </div>
                <div className="tc-date-intellectual">{format(currentTime, "EEEE • MMMM do • yyyy")}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeCenter;