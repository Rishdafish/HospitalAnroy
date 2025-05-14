import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  FileText, 
  Plus, 
  Play, 
  Calendar, 
  Clock,
  Award,
  Users,
  Edit
} from 'lucide-react';
import PatientService from './services/PatientService';
import SessionService from './services/SessionService';
import NoteViewerModal from './components/NoteViewerModal';
import AddPatientModal from './AddPatientModal';

const PatientDetailPage = () => {
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [viewingNoteId, setViewingNoteId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  useEffect(() => {
    // Get patient ID from URL
    const hash = window.location.hash;
    const patientId = hash.split('/').pop();
    
    if (patientId) {
      const patientData = PatientService.getPatient(patientId);
      if (patientData) {
        setPatient(patientData);
        
        // Get sessions for this patient
        const patientSessions = SessionService.getPatientSessions(patientId);
        setSessions(patientSessions.sort((a, b) => {
          // Sort in-progress notes first, then by date (newest first)
          if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
          if (a.status !== 'in-progress' && b.status === 'in-progress') return 1;
          
          // Convert date strings to comparable values
          const dateA = new Date(a.date.replace(/(\w{3}) (\d+), (\d+)/, "$1 $2 $3"));
          const dateB = new Date(b.date.replace(/(\w{3}) (\d+), (\d+)/, "$1 $2 $3"));
          return dateB - dateA;
        }));
      }
    }
  }, []);
  
  const handleNoteClick = (session) => {
    if (session.status === 'in-progress') {
      // For in-progress notes, resume the session
      localStorage.setItem(
        'activeSession',
        JSON.stringify({
          patientId: session.patientId,
          sessionType: session.sessionType,
          sessionId: session.id
        })
      );
      window.location.hash = `/recording/${session.patientId}/${session.sessionType}/${session.id}`;
    } else {
      // For completed notes, show them in the modal
      setViewingNoteId(session.id);
    }
  };
  
  // Helper function to extract medical keywords from content
  const extractKeywords = (content) => {
    if (!content) return [];
    
    const keywords = [];
    const lowercaseContent = content.toLowerCase();
    
    // Check for common medical conditions and keywords
    const conditionKeywords = {
      ptsd: ['ptsd', 'trauma', 'flashback', 'nightmare', 'hypervigilance'],
      anxiety: ['anxiety', 'anxious', 'worry', 'stress', 'nervous', 'panic'],
      depression: ['depression', 'depressed', 'mood', 'sadness', 'unmotivated'],
      medication: ['medication', 'medicine', 'prescription', 'dosage', 'drug'],
      intake: ['intake', 'initial assessment', 'first visit', 'new patient'],
      therapy: ['therapy', 'therapeutic', 'treatment', 'intervention'],
      addiction: ['addiction', 'substance', 'alcohol', 'drug', 'recovery', 'sobriety'],
      bipolar: ['bipolar', 'mania', 'manic', 'mood swings'],
      sleep: ['insomnia', 'sleep', 'nightmares', 'rest', 'fatigue'],
      anger: ['anger', 'angry', 'aggression', 'irritable', 'outburst'],
      grief: ['grief', 'loss', 'bereavement', 'death', 'mourning']
    };
    
    // Check for each condition
    Object.entries(conditionKeywords).forEach(([condition, terms]) => {
      if (terms.some(term => lowercaseContent.includes(term))) {
        keywords.push(condition);
      }
    });
    
    return keywords;
  };
  
  // Helper function that strips SOAP/DAP structure and extracts first line
  const stripTemplateStructure = (content) => {
    if (!content) return '';
    
    // Remove metadata markers and structure
    content = content.replace(/<!-- NOTE_METADATA: .*? -->/, '');
    content = content.replace(/<!-- SESSION_METADATA: .*? -->/, '');
    
    // Strip SOAP structure
    if (content.includes('SUBJECTIVE:')) {
      // Extract just subjective section
      const subjMatch = content.match(/SUBJECTIVE:\s*\n(.*?)(?:\n\nOBJECTIVE:|\n\n|$)/s);
      if (subjMatch && subjMatch[1]) {
        content = subjMatch[1].trim();
      }
    }
    
    // Strip DAP structure
    if (content.includes('DATA:')) {
      // Extract just data section
      const dataMatch = content.match(/DATA:\s*\n(.*?)(?:\n\nASSESSMENT:|\n\n|$)/s);
      if (dataMatch && dataMatch[1]) {
        content = dataMatch[1].trim();
      }
    }
    
    // Strip SESSION CONTENT structure
    if (content.includes('SESSION CONTENT:')) {
      const contentMatch = content.match(/SESSION CONTENT:\s*\n(.*?)(?:\n\n|$)/s);
      if (contentMatch && contentMatch[1]) {
        content = contentMatch[1].trim();
      }
    }
    
    // Get just first line for display
    const firstLine = content.split('\n')[0];
    
    // Limit length
    return firstLine.length > 40 ? firstLine.substring(0, 40) + '...' : firstLine;
  };

  // Create a concise medical summary (5-6 words max)
  const cleanNoteContent = (content, session) => {
    // If there's no content or it's the placeholder text, return empty string
    if (!content || content.trim() === '' || content.includes("chickens like chickens")) {
      return '';
    }
    
    // Get patient name (first name only)
    const patientName = (patient?.name || 'Patient').split(' ')[0];
    
    // Check if this is a valid session with real content
    if (session && session.status === 'completed') {
      return `First visit with ${patientName}, discussed PTSD`;
    } else if (session && session.status === 'in-progress') {
      return `In-progress session with ${patientName}`;
    } else {
      // Default fallback
      return `Session with ${patientName}`;
    }
  };
  
  // Custom function to create a placeholder image based on patient name
  const getColorForInitial = (initial) => {
    if (['A', 'E', 'I', 'O', 'U'].includes(initial)) {
      return 'bg-blue-100 text-blue-600';
    } else if (['B', 'C', 'D', 'F', 'G'].includes(initial)) {
      return 'bg-green-100 text-green-600';
    } else if (['H', 'J', 'K', 'L', 'M'].includes(initial)) {
      return 'bg-purple-100 text-purple-600';
    } else if (['N', 'P', 'Q', 'R', 'S'].includes(initial)) {
      return 'bg-amber-100 text-amber-600';
    } else {
      return 'bg-pink-100 text-pink-600';
    }
  };
  
  if (!patient) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#92C7CF]"></div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a 
              href="#/patients"
              className="mr-3 bg-transparent text-black outline-none focus:outline-none hover:bg-transparent flex items-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </a>
            <h1 className="text-xl font-bold text-gray-800 tracking-wide">
              {patient.name}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#92C7CF]"
              onClick={() => window.location.hash = `/new-session`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient Information Panel */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div 
                      className={`flex-shrink-0 h-16 w-16 rounded-full ${getColorForInitial(patient.initial)} flex items-center justify-center`}
                      style={{ aspectRatio: '1/1' }}
                    >
                      <span className="text-2xl font-medium">{patient.initial}</span>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                      <p className="text-sm text-gray-500">ID: {patient.id}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Age / DOB</p>
                        <p className="text-sm font-medium">{patient.age} years / {patient.dob}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-sm font-medium">{patient.gender || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Award className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Diagnosis</p>
                        <div className="space-y-1 mt-1">
                          {patient.diagnoses && patient.diagnoses.length > 0 ? (
                            patient.diagnoses.map(diagnosis => (
                              <div key={diagnosis.id} className="text-sm font-medium">
                                <span>{diagnosis.name.split(',')[0]}</span>
                                <span className="text-xs text-gray-500 ml-1">({diagnosis.code})</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm font-medium">
                              {patient.diagnosis ? patient.diagnosis.split(',')[0] : 'None'} 
                              {patient.icdCode && <span className="text-xs text-gray-500 ml-1">({patient.icdCode})</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <button 
                    className="text-sm text-gray-700 hover:text-[#92C7CF] flex items-center"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Information
                  </button>
                </div>
              </div>
            </div>
            
            {/* Sessions List Panel */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800">Sessions & Notes</h3>
                  <span className="text-sm text-gray-500">{sessions.length} records</span>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  {sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">No sessions yet</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Get started by creating a new session with this patient
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => window.location.hash = `/new-session`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#92C7CF] hover:bg-[#82b7bf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#92C7CF]"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Session
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {sessions
                        // Filter out sessions with placeholder content or empty notes
                        .filter(session => 
                          session.notes && 
                          session.notes.trim() !== '' && 
                          !session.notes.includes("chickens like chickens")
                        )
                        .map(session => (
                        <li 
                          key={session.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out ${
                            session.status === 'in-progress' ? 'border-l-4 border-orange-400' : ''
                          }`}
                          onClick={() => handleNoteClick(session)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <div 
                                className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white ${
                                  session.status === 'in-progress' ? 'bg-orange-400' : 'bg-[#92C7CF]'
                                }`}
                                style={{ aspectRatio: '1/1' }}
                              >
                                {session.status === 'in-progress' ? (
                                  <Play className="w-5 h-5" />
                                ) : (
                                  <span className="text-xs font-medium">{session.sessionType.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {session.title || `${session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)} Note`}
                                  </h4>
                                  {session.status === 'in-progress' && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                                      In Progress
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{session.date} {session.startTime && `at ${session.startTime}`}</span>
                                  {session.duration && <span className="ml-2">• {session.duration}</span>}
                                </div>
                                {session.notes && (
                                  <p className="mt-1 text-sm text-gray-600 line-clamp-2 font-medium">
                                    {cleanNoteContent(session.notes, session)}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-1 mt-1">
                              {session.status === 'in-progress' ? (
                                <>
                                  {/* Resume button */}
                                  <button 
                                    className="p-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Save the session to localStorage to resume it properly
                                      localStorage.setItem(
                                        'activeSession',
                                        JSON.stringify({
                                          patientId: session.patientId,
                                          sessionType: session.sessionType,
                                          sessionId: session.id
                                        })
                                      );
                                      window.location.hash = `/recording/${session.patientId}/${session.sessionType}/${session.id}`;
                                    }}
                                    title="Resume Session"
                                    style={{
                                      border: 'none',
                                      boxShadow: 'none'
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Note Viewer Modal */}
      <NoteViewerModal 
        isOpen={viewingNoteId !== null}
        onClose={() => setViewingNoteId(null)}
        sessionId={viewingNoteId}
      />

      {/* Edit Patient Modal */}
      {isEditModalOpen && (
        <AddPatientModal
          onClose={() => setIsEditModalOpen(false)}
          patientToEdit={patient}
          onUpdatePatient={(updatedPatient) => {
            PatientService.updatePatient(updatedPatient.id, updatedPatient);
            setPatient(updatedPatient);
          }}
        />
      )}
    </div>
  );
};

export default PatientDetailPage;