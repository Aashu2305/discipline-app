import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, MapPin } from 'lucide-react';

const STEPS = [
  {
    target: null, // Center screen
    title: "Welcome to Discipline.",
    content: "This is your command center. Let's take a quick tour of how to dominate your day."
  },
  {
    target: "sidebar-nav",
    title: "Navigation Deck",
    content: "Switch between your Tracker, the Schedule (Alarm) center, and your Zen Notebook."
  },
  {
    target: "xp-card",
    title: "XP & Levels",
    content: "Every habit you complete gives you XP. Consistency is the only way to level up."
  },
  {
    target: "calendar-heatmap",
    title: "Consistency Heatmap",
    content: "This calendar tracks your intensity. The darker the green, the more disciplined you were that day."
  },
  {
    target: "stats-carousel",
    title: "Performance Graphs",
    content: "Click this chart to switch between your 'Trend Line' and 'Volume Bar'. It auto-rotates every 5 seconds."
  },
  {
    target: "daily-goals",
    title: "Daily Habits",
    content: "Your core routine lives here. Check them off. If you miss a day, you lose XP."
  },
  {
    target: "schedule-section",
    title: "Alarm Command Center",
    content: "Set loops (e.g., Drink Water every hour) or fixed alarms here. Use the toggle to choose between 'Ring' or 'Notify'."
  }
];

const Tour = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const currentStep = STEPS[stepIndex];

  // --- POSITION ENGINE ---
  useEffect(() => {
    const updatePosition = () => {
      if (!currentStep.target) {
        setRect(null); // No target = Center Modal
        return;
      }
      const el = document.getElementById(currentStep.target);
      if (el) {
        // 1. Scroll to element
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        // 2. Capture coordinates
        const r = el.getBoundingClientRect();
        setRect({
          top: r.top - 10,
          left: r.left - 10,
          width: r.width + 20,
          height: r.height + 20,
          bottom: r.bottom + 10
        });
      }
    };

    // Delay allows rendering/scroll to settle
    setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [stepIndex, currentStep]);

  const handleNext = () => {
    if (stepIndex >= STEPS.length - 1) onComplete();
    else setStepIndex(prev => prev + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(prev => prev - 1);
  };

  // --- STYLES ---

  // 1. The Container (Must be transparent so we can see through the hole)
  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    zIndex: 9999, 
    pointerEvents: 'auto', // Blocks clicking outside
    background: 'transparent' // CRITICAL: The darkness comes from the shadow below
  };

  // 2. The Spotlight (The "Hole")
  const highlightBoxStyle = rect ? {
    position: 'absolute',
    top: rect.top, 
    left: rect.left, 
    width: rect.width, 
    height: rect.height,
    
    // THE MAGIC TRICK:
    // We use a massive shadow to darken everything *outside* the box.
    // The box itself remains transparent (showing the content underneath).
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)', 
    
    borderRadius: '12px',
    border: '2px solid #fbbf24', // Bright yellow border
    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    pointerEvents: 'none' // Let clicks pass through to the underlying element
  } : {
    // If no target (Welcome Step), we just darken the whole screen
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0, 0, 0, 0.85)',
    transition: 'background 0.5s ease'
  };

  // 3. The Tooltip (Guide Card)
  let tooltipStyle = {
    position: 'absolute',
    background: '#18181b', border: '1px solid #3f3f46', borderRadius: '16px',
    padding: '24px', width: '320px', color: '#fff',
    boxShadow: '0 20px 50px -10px rgba(0,0,0,1)',
    transition: 'all 0.4s ease',
    zIndex: 10000
  };

  if (!rect) {
    // Center Screen for Welcome Message
    tooltipStyle = { ...tooltipStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  } else {
    // Smart Placement Logic
    const spaceRight = window.innerWidth - rect.left - rect.width;
    const spaceBottom = window.innerHeight - rect.bottom;

    if (spaceRight > 340) {
       tooltipStyle.left = rect.left + rect.width + 24;
       tooltipStyle.top = rect.top;
    } else if (spaceBottom > 250) {
       tooltipStyle.top = rect.bottom + 24;
       tooltipStyle.left = Math.max(20, rect.left);
    } else {
       tooltipStyle.top = rect.top - 220;
       tooltipStyle.left = Math.max(20, rect.left);
    }
  }

  return (
    <div style={overlayStyle}>
      
      {/* The Spotlight Hole */}
      <div style={highlightBoxStyle} />

      {/* The Guide Card */}
      <div style={tooltipStyle}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= stepIndex ? '#fbbf24' : '#3f3f46', transition: 'background 0.3s' }} />
          ))}
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
          {stepIndex === 0 && <MapPin className="text-yellow-500" size={20}/>}
          {currentStep.title}
        </h3>
        <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
          {currentStep.content}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #27272a', paddingTop: '16px' }}>
          <button onClick={onComplete} style={{ background: 'transparent', border: 'none', color: '#71717a', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}>Skip</button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleBack} disabled={stepIndex === 0} style={{ background: '#27272a', border: '1px solid #3f3f46', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: stepIndex === 0 ? 'not-allowed' : 'pointer', opacity: stepIndex === 0 ? 0.5 : 1, color: '#fff' }}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNext} style={{ background: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', height: '40px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#000', fontWeight: 'bold' }}>
              {stepIndex === STEPS.length - 1 ? "Finish" : "Next"} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tour;