import React, { useState } from 'react';
import { PenTool, Trash2, Plus } from 'lucide-react';

const Notebook = ({ notes, onAdd, onDelete, onUpdate, setView }) => {
  const [activeNoteId, setActiveNoteId] = useState(notes.length > 0 ? notes[0].id : null);
  const activeNote = notes.find(n => n.id === activeNoteId) || (notes.length > 0 ? notes[0] : null);

  const handleUpdate = (field, value) => {
    if (!activeNote) return;
    const title = field === 'title' ? value : activeNote.title;
    const body = field === 'body' ? value : activeNote.body;
    onUpdate(activeNote.id, title, body);
  };

  return (
    <main className="main-content" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ width: '250px', borderRight: '1px solid #27272a', background: '#09090b', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PenTool size={18} className="text-yellow-500"/> Notes
          </h2>
          <button onClick={() => { onAdd(); setTimeout(() => setActiveNoteId(notes[0]?.id), 100); }} style={{ background: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={16} color="#000"/>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notes.map(note => (
            <div key={note.id} onClick={() => setActiveNoteId(note.id)} style={{ padding: '15px', borderBottom: '1px solid #27272a', cursor: 'pointer', background: activeNoteId === note.id ? '#18181b' : 'transparent', borderLeft: activeNoteId === note.id ? '3px solid #fbbf24' : '3px solid transparent' }}>
              <div style={{ fontWeight: '600', color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.title || "Untitled Note"}</div>
              <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{note.date}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '1rem' }}>
          <button onClick={() => setView('tracker')} style={{ width: '100%', padding: '10px', background: '#27272a', color: '#a1a1aa', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Tracker</button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000' }}>
        {activeNote ? (
          <>
            <div style={{ padding: '2rem 2rem 1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <input type="text" placeholder="Note Title..." value={activeNote.title} onChange={(e) => handleUpdate('title', e.target.value)} style={{ background: 'transparent', border: 'none', fontSize: '2rem', fontWeight: 'bold', color: '#fff', outline: 'none', width: '100%' }} />
               <button onClick={() => onDelete(activeNote.id)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: '10px' }}><Trash2 size={20} /></button>
            </div>
            <textarea placeholder="Write something..." value={activeNote.body} onChange={(e) => handleUpdate('body', e.target.value)} style={{ flex: 1, background: 'transparent', border: 'none', color: '#d4d4d8', fontSize: '1.1rem', padding: '0 2rem 2rem 2rem', resize: 'none', outline: 'none', lineHeight: '1.6' }} />
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#3f3f46' }}>Select or create a note</div>
        )}
      </div>
    </main>
  );
};
export default Notebook;