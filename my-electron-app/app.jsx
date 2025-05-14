import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './dashboard';
import PatientsPage from './PatientsPage';
import PatientDetailPage from './PatientDetailPage';
import SessionPage from './SessionPage';
import TemplatePage from './TemplatePage';
import AudioRecordingPage from './sessions/AudioRecordingPage';
import FullNoteView from './sessions/FullNoteView';

// Wrapper component to handle loading session data
const RecordingWrapper = () => {
  const [sessionData, setSessionData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  
  React.useEffect(() => {
    try {
      // Check if we have a session ID in the URL (for resuming in-progress sessions)
      const hashParts = window.location.hash.split('/');
      if (hashParts.length >= 4 && hashParts[1] === 'recording') {
        // Format is #/recording/patientId/sessionType/sessionId
        const patientId = hashParts[2];
        const sessionType = hashParts[3];
        const sessionId = hashParts[4];
        
        if (patientId && sessionType && sessionId) {
          // We're resuming an existing session
          setSessionData({
            patientId,
            sessionType,
            sessionId
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Regular flow - Get session data from localStorage
      const activeSession = localStorage.getItem('activeSession');
      if (activeSession) {
        try {
          const parsedData = JSON.parse(activeSession);
          setSessionData(parsedData);
          setIsLoading(false);
        } catch (parseError) {
          console.error('Error parsing session data:', parseError);
          setShouldRedirect(true);
        }
      } else {
        // No session data, redirect to new session page
        setShouldRedirect(true);
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      setShouldRedirect(true);
    }
    setIsLoading(false);
  }, []);
  
  if (shouldRedirect) {
    return <Navigate to="/new-session" replace />;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#92C7CF]"></div>
      </div>
    );
  }
  
  if (!sessionData) {
    return <Navigate to="/new-session" replace />;
  }
  
  // Check that all required fields exist before rendering
  if (!sessionData.patientId) {
    console.error("Invalid session data - missing patientId:", sessionData);
    return <Navigate to="/new-session" replace />;
  }
  
  try {
    return (
      <AudioRecordingPage 
        patientId={sessionData.patientId}
        sessionType={sessionData.sessionType || 'dap'} 
        sessionData={sessionData.sessionId || sessionData}
      />
    );
  } catch (error) {
    console.error("Error rendering AudioRecordingPage:", error);
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 max-w-md">
          <h3 className="font-bold mb-2">Error Loading Session</h3>
          <p>There was a problem loading this recording session.</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
        <a 
          href="#/new-session" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Session Setup
        </a>
      </div>
    );
  }
};

// Wrapper component for FullNoteView to handle URL parameters
const NoteViewWrapper = () => {
  const [sessionId, setSessionId] = React.useState(null);
  
  React.useEffect(() => {
    const location = window.location.hash;
    const id = location.split('/').pop();
    if (id) {
      setSessionId(id);
    }
  }, []);
  
  if (!sessionId) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#92C7CF]"></div>
      </div>
    );
  }
  
  return <FullNoteView sessionId={sessionId} />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patient/:id" element={<PatientDetailPage />} />
        <Route path="/new-session" element={<SessionPage />} />
        <Route path="/templates" element={<TemplatePage />} />
        <Route path="/recording" element={<RecordingWrapper />} />
        <Route path="/recording/:patientId/:sessionType/:sessionId" element={<RecordingWrapper />} />
        <Route path="/note/:id" element={<NoteViewWrapper />} />
      </Routes>
    </Router>
  );
};

export default App;