import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, User, FileText, ArrowLeft, Printer, Mail, Download } from 'lucide-react';
import PatientService from '../services/PatientService';
import SessionService from '../services/SessionService';

const FullNoteView = ({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [patient, setPatient] = useState(null);
  const [pastSessions, setPastSessions] = useState([]);
  
  useEffect(() => {
    // Load session data
    const sessionData = SessionService.getSession(sessionId);
    if (sessionData) {
      setSession(sessionData);
      
      // Load patient data
      const patientData = PatientService.getPatient(sessionData.patientId);
      if (patientData) {
        setPatient(patientData);
        
        // Load past sessions for this patient
        const patientSessions = SessionService.getPatientSessions(patientData.id)
          .filter(s => s.status === 'completed')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setPastSessions(patientSessions);
      }
    }
  }, [sessionId]);
  
  if (!session || !patient) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#92C7CF]"></div>
      </div>
    );
  }
  
  // Parse and format note content based on session type
  const renderNoteContent = () => {
    const noteContent = session.notes || '';
    
    // Determine the session type and render accordingly
    switch(session.sessionType?.toLowerCase()) {
      case 'dap':
        // Try to parse DAP note format
        const dapSections = noteContent.split(/\n\n(?:DATA|ASSESSMENT|PLAN):\n/i);
        
        if (dapSections.length >= 3) {
          return (
            <div className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h2 className="text-lg font-bold text-amber-800 mb-2">DATA</h2>
                <div className="whitespace-pre-wrap">{dapSections[1]}</div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h2 className="text-lg font-bold text-amber-800 mb-2">ASSESSMENT</h2>
                <div className="whitespace-pre-wrap">{dapSections[2]}</div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h2 className="text-lg font-bold text-amber-800 mb-2">PLAN</h2>
                <div className="whitespace-pre-wrap">{dapSections[3] || ''}</div>
              </div>
            </div>
          );
        }
        break;
        
      case 'soap':
        // Try to parse SOAP note format
        const soapSections = noteContent.split(/\n\n(?:SUBJECTIVE|OBJECTIVE|ASSESSMENT|PLAN):\n/i);
        
        if (soapSections.length >= 4) {
          return (
            <div className="space-y-6">
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <h2 className="text-lg font-bold text-cyan-800 mb-2">SUBJECTIVE</h2>
                <div className="whitespace-pre-wrap">{soapSections[1]}</div>
              </div>
              
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <h2 className="text-lg font-bold text-cyan-800 mb-2">OBJECTIVE</h2>
                <div className="whitespace-pre-wrap">{soapSections[2]}</div>
              </div>
              
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <h2 className="text-lg font-bold text-cyan-800 mb-2">ASSESSMENT</h2>
                <div className="whitespace-pre-wrap">{soapSections[3]}</div>
              </div>
              
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <h2 className="text-lg font-bold text-cyan-800 mb-2">PLAN</h2>
                <div className="whitespace-pre-wrap">{soapSections[4] || ''}</div>
              </div>
            </div>
          );
        }
        break;
        
      case 'emdr':
        return (
          <div className="space-y-6">
            <div className="bg-violet-50 p-4 rounded-lg border border-violet-200">
              <h2 className="text-lg font-bold text-violet-800 mb-2">EMDR SESSION NOTES</h2>
              <div className="whitespace-pre-wrap">{noteContent}</div>
            </div>
          </div>
        );
        
      case 'psychiatric intake':
      case 'psychiatric_intake':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h2 className="text-lg font-bold text-emerald-800 mb-2">PSYCHIATRIC INTAKE</h2>
              <div className="whitespace-pre-wrap">{noteContent}</div>
            </div>
          </div>
        );
      
      // Add more session types as needed
      
      default:
        // Generic format for other session types
        return (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {session.sessionType?.toUpperCase() || 'SESSION'} NOTES
            </h2>
            <div className="whitespace-pre-wrap">{noteContent}</div>
          </div>
        );
    }
    
    // Fallback if parsing failed
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          {session.sessionType?.toUpperCase() || 'SESSION'} NOTES
        </h2>
        <div className="whitespace-pre-wrap">{noteContent}</div>
      </div>
    );
  };
  
  // Get tag style for a given session type
  const getTagStyle = (type) => {
    switch((type || '').toLowerCase()) {
      case 'family':
        return 'bg-sky-100 text-sky-800';
      case 'emdr':
        return 'bg-violet-100 text-violet-800';
      case 'psychiatric intake':
      case 'psychiatric_intake':
        return 'bg-emerald-100 text-emerald-800';
      case 'psychiatric follow-up':
      case 'psychiatric_followup':
        return 'bg-teal-100 text-teal-800';
      case 'relationship':
        return 'bg-pink-100 text-pink-800';
      case 'dap':
        return 'bg-amber-100 text-amber-800';
      case 'soap':
        return 'bg-cyan-100 text-cyan-800';
      case 'individual':
        return 'bg-indigo-100 text-indigo-800';
      case 'therapy':
        return 'bg-purple-100 text-purple-800';
      case 'intake':
        return 'bg-lime-100 text-lime-800';
      case 'eap intake':
      case 'eap_intake':
        return 'bg-orange-100 text-orange-800';
      case 'speech therapy':
      case 'speech_therapy':
        return 'bg-rose-100 text-rose-800';
      case 'consult':
        return 'bg-fuchsia-100 text-fuchsia-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left sidebar - Past notes */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button 
            className="flex items-center text-gray-600" 
            onClick={() => window.location.hash = '/'}
            style={{
              background: 'none',
              border: 'none',
              boxShadow: 'none',
              padding: '6px 10px',
              borderRadius: '20px'
            }}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to dashboard
          </button>
        </div>
        
        {/* Patient info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <div className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3`}>
              <span className="text-sm font-medium">{patient.initial}</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{patient.name}</h3>
              <p className="text-xs text-gray-500">{patient.gender}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              <span>Age: {patient.age}</span>
            </div>
            <div className="flex items-center mt-1">
              <span>DOB: {patient.dob}</span>
            </div>
            <div className="flex items-center mt-1">
              <span>Diagnosis: {patient.diagnosis}</span>
            </div>
          </div>
        </div>
        
        {/* Past notes list */}
        <div className="flex-1 overflow-auto p-4">
          <h3 className="font-medium text-gray-800 mb-3">Past Notes</h3>
          
          <div className="space-y-3">
            {pastSessions.map((pastSession, index) => (
              <div 
                key={pastSession.id}
                className={`p-3 rounded-lg hover:shadow-sm cursor-pointer border ${
                  pastSession.id === session.id 
                    ? 'bg-[#f0f9fa] border-[#92C7CF]' 
                    : 'bg-white border-gray-200'
                }`}
                onClick={() => window.location.hash = `/note/${pastSession.id}`}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium text-sm">
                      {pastSession.sessionType?.charAt(0).toUpperCase() + 
                       pastSession.sessionType?.slice(1) || 'Session'} Note
                    </h4>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{pastSession.date}</span>
                    </div>
                  </div>
                  
                  {/* Session type tag */}
                  <span className={`px-2 py-0.5 rounded-full text-xs self-start ${
                    getTagStyle(pastSession.sessionType)
                  }`}>
                    {pastSession.sessionType?.toUpperCase() || 'NOTE'}
                  </span>
                </div>
                
                {/* Very short preview if available */}
                {pastSession.notes && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-1">
                    {pastSession.notes.substring(0, 60)}...
                  </p>
                )}
                
                {/* "New" indicator only for most recent note */}
                {index === 0 && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    Most Recent
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content - Note view */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-wide">
                {session.title || `${session.sessionType?.toUpperCase() || 'SESSION'} NOTE`}
              </h1>
              <p className="text-sm text-gray-600">
                {patient.name} • {session.date}
                {session.startTime && ` • ${session.startTime}`}
                {session.duration && ` • ${session.duration}`}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => window.print()}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-full"
                style={{
                  background: 'none',
                  border: 'none'
                }}
              >
                <Printer className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const subject = `Session Notes: ${patient?.name || 'Patient'} - ${session.date}`;
                  const body = `Session Notes for ${patient?.name || 'Patient'} on ${session.date}%0D%0A%0D%0A${
                    session.notes?.replace(/\n/g, '%0D%0A') || ''
                  }`;
                  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
                }}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-full"
                style={{
                  background: 'none',
                  border: 'none'
                }}
              >
                <Mail className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const filename = `session-notes-${patient?.name || 'patient'}-${session.date.replace(/\s/g, '-')}.txt`;
                  const content = `Session Notes for ${patient?.name || 'Patient'} on ${session.date}\n\n${session.notes || ''}`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  
                  // Cleanup
                  setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }, 0);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-full"
                style={{
                  background: 'none',
                  border: 'none'
                }}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Note content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Session metadata */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-gray-500">Date</div>
                  <div className="font-medium">{session.date}</div>
                </div>
                {session.startTime && (
                  <div>
                    <div className="text-xs text-gray-500">Start Time</div>
                    <div className="font-medium">{session.startTime}</div>
                  </div>
                )}
                {session.endTime && (
                  <div>
                    <div className="text-xs text-gray-500">End Time</div>
                    <div className="font-medium">{session.endTime}</div>
                  </div>
                )}
                {session.duration && (
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-medium">{session.duration}</div>
                  </div>
                )}
                {session.location && (
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="font-medium">{session.location}</div>
                  </div>
                )}
                {session.cptCode && (
                  <div>
                    <div className="text-xs text-gray-500">CPT Code</div>
                    <div className="font-medium">{session.cptCode}</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Session content */}
            {renderNoteContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullNoteView;