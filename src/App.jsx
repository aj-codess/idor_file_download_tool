// src/App.jsx
import { useState } from 'react';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import './App.css';

function App() {
  const [authToken, setAuthToken] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (!authToken || !fileUrl) {
      setMessage('Please provide both authToken and fileUrl.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setProgress(0);

    try {
      const response = await axios.get(fileUrl, {
        headers: {
          auth: `Bearer ${authToken}`,
        },
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percentCompleted);
        },
      });

      // Create a blob URL and trigger download
   const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "idor_file.pdf");
    document.body.appendChild(link);
    link.click();

      //cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage('File downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      setMessage(`Error: ${error.message || 'Failed to download file. Check token/URL.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>File Downloader Tool</h1>
      <p>For cybersecurity testing (e.g., IDOR on local server). Enter authToken and file URL below.</p>

      <div className="card">
        <label htmlFor="authToken">Auth Token (Bearer):</label>
        <input
          id="authToken"
          type="text"
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          placeholder="e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="input-field"
        />

        <label htmlFor="fileUrl">File URL:</label>
        <input
          id="fileUrl"
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="e.g., http://localhost:3000/files/123"
          className="input-field"
        />

        <button onClick={handleDownload} disabled={isLoading} className="download-button">
          {isLoading ? 'Downloading...' : 'Download File'}
        </button>

        {isLoading && (
          <div className="progress-container">
            <ClipLoader color="#646cff" loading={isLoading} size={50} />
            <p>Progress: {progress}%</p>
          </div>
        )}

        {message && <p className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}
      </div>

      <p className="footer">Built with React + Vite for fast testing. Test on local servers only.</p>
    </div>
  );
}

export default App;