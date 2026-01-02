// --- EXPORT DATA ---
export const exportUserData = (data) => {
  const fileName = `discipline-data-${new Date().toISOString().split('T')[0]}.json`;
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

// --- IMPORT DATA ---
export const importUserData = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      callback(json);
    } catch (err) {
      alert("Yo bro, that file is corrupted or not a valid JSON!");
    }
  };
  reader.readAsText(file);
};