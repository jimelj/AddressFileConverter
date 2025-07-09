import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [convertedData, setConvertedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setConvertedData(null);
      setPreviewData(null);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    
    try {
      const response = await fetch('https://addressfileconverter.onrender.com/api/convert', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setConvertedData(result);
        setPreviewData(result);
      } else {
        setError(result.error || 'Conversion failed');
      }
    } catch (err) {
      setError('Error connecting to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTXT = () => {
    if (!convertedData || !convertedData.textContent) return;
    let baseName = file && file.name ? file.name.replace(/\.[^/.]+$/, '') : 'converted_data';
    const downloadName = baseName + '_proc.txt';
    const blob = new Blob([convertedData.textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Helper to parse CSV textContent into rows/columns
  function parseCSVText(text) {
    if (!text) return { headers: [], rows: [] };
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return { headers: [], rows: [] };
    const parseLine = line => {
      // Split on commas not inside quotes
      const regex = /\"([^\"]*)\"|(?<=,|^)(?=,|$)/g;
      const matches = [...line.matchAll(regex)];
      return matches.map(m => m[1] !== undefined ? m[1] : '');
    };
    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine);
    return { headers, rows };
  }

  const parsedPreview = previewData && previewData.textContent ? parseCSVText(previewData.textContent) : { headers: [], rows: [] };

  return (
    <div className="App">
      <header className="App-header">
                 <h1>📊 CSV to TXT Converter</h1>
         <p>Upload your CSV file and convert it to a formatted text file</p>
      </header>

      <main className="App-main">
        <div className="upload-section">
          <div className="file-upload-area">
                         <input
               type="file"
               id="file-input"
               accept=".csv,.xlsx,.xls"
               onChange={handleFileChange}
               className="file-input"
             />
                         <label htmlFor="file-input" className="file-label">
               <div className="upload-icon">📁</div>
               <span>{file ? file.name : 'Choose CSV file or drag here'}</span>
             </label>
          </div>

          {file && (
            <button 
              onClick={handleConvert} 
              disabled={loading}
              className="convert-btn"
            >
              {loading ? 'Converting...' : 'Convert File'}
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {parsedPreview.headers.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h2>Conversion Results</h2>
              <button onClick={downloadTXT} className="download-btn">
                📥 Download TXT
              </button>
            </div>
            <div className="data-preview">
              <h3>Data Preview (First 10 rows)</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      {parsedPreview.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.rows.slice(0, 200).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="data-summary">
                Total rows: {parsedPreview.rows.length} | 
                Total columns: {parsedPreview.headers.length}
              </p>
            </div>
          </div>
        )}

        {previewData && (
          <div className="text-preview">
            <h3>Text Output Preview</h3>
            <div className="text-container">
              <pre>{previewData.textContent}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
