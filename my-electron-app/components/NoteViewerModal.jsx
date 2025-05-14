import React, { useState, useEffect } from 'react';
import { Clock, FileText, Download, Printer, Mail } from 'lucide-react';
import Modal from './Modal';
import SessionService from '../services/SessionService';
import PatientService from '../services/PatientService';

const NoteViewerModal = ({ isOpen, onClose, sessionId }) => {
  const [session, setSession] = useState(null);
  const [patient, setPatient] = useState(null);
  
  useEffect(() => {
    if (sessionId) {
      const sessionData = SessionService.getSession(sessionId);
      if (sessionData) {
        setSession(sessionData);
        
        // Load patient data
        if (sessionData.patientId) {
          const patientData = PatientService.getPatient(sessionData.patientId);
          setPatient(patientData);
        }
      }
    }
  }, [sessionId]);
  
  if (!session) return null;
  
  // Get formatting for specific note types
  const getNoteTypeFormatting = (type) => {
    switch((type || '').toLowerCase()) {
      case 'dap':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200', 
          title: 'text-amber-800'
        };
      case 'soap':
        return {
          bg: 'bg-cyan-50',
          border: 'border-cyan-200',
          title: 'text-cyan-800'
        };
      case 'emdr':
        return {
          bg: 'bg-violet-50',
          border: 'border-violet-200',
          title: 'text-violet-800'
        };
      case 'psychiatric intake':
      case 'psychiatric_intake':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          title: 'text-emerald-800'
        };
      case 'therapy':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          title: 'text-purple-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          title: 'text-gray-800'
        };
    }
  };
  
  // Clean metadata from note content
  const cleanNoteContent = (content) => {
    if (!content) return '';
    
    // Remove any session metadata that might be in the notes
    return content.replace(/\n\n<!-- SESSION_METADATA: .*? -->/, '');
  };
  
  // Parse and format note content based on session type
  const renderNoteContent = () => {
    const rawContent = session.notes || '';
    const noteContent = cleanNoteContent(rawContent);
    const noteType = session.sessionType?.toLowerCase() || '';
    const formatting = getNoteTypeFormatting(noteType);
    
    // Determine the session type and render accordingly
    switch(noteType) {
      case 'dap':
        // Try to parse DAP note format
        const dapSections = noteContent.split(/\n\n(?:DATA|ASSESSMENT|PLAN):\n/i);
        
        if (dapSections.length >= 3) {
          return (
            <div className="space-y-4">
              <div className={`${formatting.bg} p-4 rounded-lg border ${formatting.border}`}>
                <h2 className={`text-lg font-bold ${formatting.title} mb-2`}>DATA</h2>
                <div className="whitespace-pre-wrap text-gray-800">{dapSections[1]}</div>
              </div>
              
              <div className={`${formatting.bg} p-4 rounded-lg border ${formatting.border}`}>
                <h2 className={`text-lg font-bold ${formatting.title} mb-2`}>ASSESSMENT</h2>
                <div className="whitespace-pre-wrap text-gray-800">{dapSections[2]}</div>
              </div>
              
              <div className={`${formatting.bg} p-4 rounded-lg border ${formatting.border}`}>
                <h2 className={`text-lg font-bold ${formatting.title} mb-2`}>PLAN</h2>
                <div className="whitespace-pre-wrap text-gray-800">{dapSections[3] || ''}</div>
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
            <div className="space-y-4">
              <div className={`${formatting.bg} p-4 rounded-lg border ${formatting.border}`}>
                <h2 className={`text-lg font-bold ${formatting.title} mb-2`}>SUBJECTIVE</h2>
                <div className="whitespace-pre-wrap text-gray-800">{soapSections[1]}</div>
              </div>
              
              <div className={`${formatting.bg} p-4 rounded-lg border ${formatting.border}`}>
                <h2 className={`text-lg font-bold ${formatting.title} mb-2`}>OBJECTIVE</h2>
                <div className="whitespace-pre-wrap text-gray-800">{soapSections[2]}</div>
              </div>
              
              <div className={`${formatting.bg} p-4 rounded-lg border ${formatting.border}`}>
                <h2 className={`text-lg font-bold ${formatting.title} mb-2`}>ASSESSMENT</h2>
                <div className="whitespace-pre-wrap text-gray-800">{soapSections[3]}</div>
              </div>
              
              <div className={`${formatting.bg} p-4 rounded-lg border ${formatting.border}`}>
                <h2 className={`text-lg font-bold ${formatting.title} mb-2`}>PLAN</h2>
                <div className="whitespace-pre-wrap text-gray-800">{soapSections[4] || ''}</div>
              </div>
            </div>
          );
        }
        break;
    }
    
    // Default/fallback for any type or if parsing failed
    return (
      <div className={`${formatting.bg} p-4 rounded-lg border ${formatting.border}`}>
        <h2 className={`text-lg font-bold ${formatting.title} mb-2`}>
          {session.sessionType?.toUpperCase() || 'SESSION'} NOTES
        </h2>
        <div className="whitespace-pre-wrap text-gray-800">{noteContent}</div>
      </div>
    );
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={session.title || `${session.sessionType?.toUpperCase() || 'Session'} Note`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Session Metadata */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-2">
            <div>
              <div className="text-xs text-gray-500">Patient</div>
              <div className="font-medium">{patient?.name || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Date</div>
              <div className="font-medium">{session.date}</div>
            </div>
            {session.startTime && (
              <div>
                <div className="text-xs text-gray-500">Time</div>
                <div className="font-medium">{session.startTime}</div>
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
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 mt-3">
            <button 
              onClick={() => window.print()}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-50"
              style={{
                background: 'none',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const subject = `Session Notes: ${patient?.name || 'Patient'} - ${session.date}`;
                const body = `Session Notes for ${patient?.name || 'Patient'} on ${session.date}%0D%0A%0D%0A${
                  session.notes?.replace(/\n/g, '%0D%0A') || ''
                }`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-50"
              style={{
                background: 'none',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              <Mail className="w-4 h-4" />
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
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-50"
              style={{
                background: 'none',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Note Content */}
        {renderNoteContent()}
      </div>
    </Modal>
  );
};

export default NoteViewerModal;