import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Mic, Edit2, UploadCloud, FileText, Hash } from 'lucide-react';
import PatientService from './services/PatientService';
import TemplateService from './services/TemplateService';
import SessionService from './services/SessionService';
import NoteTypeSelector from './components/NoteTypeSelector';
import SelectControl from './components/SelectControl';
import FileUploader from './components/FileUploader';

const builtInNoteTypes = [
  { id: 'soap', name: 'SOAP Note', icon: FileText },
  { id: 'dap', name: 'DAP Note', icon: Hash },
  { id: 'therapy', name: 'Therapy Note', icon: Edit2 },
  { id: 'intake', name: 'Intake Note', icon: FileText },
  { id: 'emdr', name: 'EMDR Note', icon: Mic },
  { id: 'birp', name: 'BIRP Note', icon: FileText },
  { id: 'girp', name: 'GIRP Note', icon: FileText },
  { id: 'spravado', name: 'SPRAVADO', icon: FileText },
  { id: 'eap_intake', name: 'EAP Intake', icon: FileText },
  { id: 'supervision', name: 'Supervision Note', icon: FileText },
  { id: 'progress', name: 'Progress Note', icon: FileText },
  { id: 'assessment', name: 'Initial Assessment', icon: FileText },
  { id: 'discharge', name: 'Discharge Note', icon: FileText },
];

const SessionPage = () => {
  const [customTemplates, setCustomTemplates] = useState([]);
  const [noteTypes, setNoteTypes] = useState([...builtInNoteTypes]);
  const [sessionMode, setSessionMode] = useState('live');
  const clients = PatientService.getPatients().map(p => ({ id: p.id, name: p.name }));
  const [noteType, setNoteType] = useState(noteTypes[0]?.id || '');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [noteTitle, setNoteTitle] = useState('');
  const [location, setLocation] = useState('telehealth');
  const [cptCode, setCptCode] = useState('');
  const fileUploadRef = useRef(null);

  useEffect(() => {
    const tmpls = TemplateService.getTemplates().map(t => ({
      id: `template_${t.id}`,
      name: t.name,
      description: '(Custom)',
      isCustom: true,
    }));
    setCustomTemplates(tmpls);
    setNoteTypes([...tmpls, ...builtInNoteTypes]);
    const unsub = TemplateService.subscribe(() => {
      const updated = TemplateService.getTemplates().map(t => ({
        id: `template_${t.id}`,
        name: t.name,
        description: '(Custom)',
        isCustom: true,
      }));
      setCustomTemplates(updated);
      setNoteTypes([...updated, ...builtInNoteTypes]);
    });
    return unsub;
  }, []);

  const handleStartSession = () => {
    if (!clientId) { alert('Please select a client'); return; }
    const newSession = SessionService.startLiveSession({
      patientId: clientId,
      sessionType: noteType,
      location,
      cptCode,
      title: noteTitle,
    });
    localStorage.setItem('activeSession', JSON.stringify({
      patientId: clientId,
      sessionType: noteType,
      sessionId: newSession.id,
    }));
    window.location.hash = '#/recording';
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => window.location.hash = '/'}>
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">New Session</h1>
      </div>

      <section>
        <h2 className="font-medium mb-2">Title</h2>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={noteTitle}
          onChange={e => setNoteTitle(e.target.value)}
          placeholder="Note Title"
        />
      </section>

      <section>
        <h2 className="font-medium mb-2">Note Type</h2>
        <NoteTypeSelector
          value={noteType}
          onChange={setNoteType}
          noteTypes={noteTypes}
          showSearch={false}
        />
      </section>

      <section>
        <h2 className="font-medium mb-2">Mode</h2>
        <div className="flex space-x-2">
          {[
            { id: 'live', icon: Mic, name: 'Live' },
            { id: 'dictate', icon: Edit2, name: 'Dictate' },
            { id: 'upload', icon: UploadCloud, name: 'Upload' },
            { id: 'describe', icon: FileText, name: 'Describe' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setSessionMode(m.id)}
              className={`px-4 py-2 rounded-lg border ${
                sessionMode === m.id 
                  ? 'bg-[#92C7CF] text-white border-[#82b7bf]' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              style={{
                transition: 'all 0.2s ease',
                boxShadow: sessionMode === m.id ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              <m.icon className="inline w-4 h-4 mr-1" /> {m.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">Client</h2>
        <SelectControl
          value={clientId}
          onChange={setClientId}
          options={clients}
          placeholder="Select Client"
        />
      </section>

      {(sessionMode === 'live' || sessionMode === 'dictate') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Location</label>
            <SelectControl
              value={location}
              onChange={setLocation}
              options={[
                { id: 'telehealth', name: 'Telehealth' },
                { id: 'inperson', name: 'In-Person' },
              ]}
              placeholder="Location"
            />
          </div>
          <div>
            <label className="block mb-1">CPT Code</label>
            <SelectControl
              value={cptCode}
              onChange={setCptCode}
              options={[
                { id: '90791', name: '90791 Psych Eval' },
                { id: '90834', name: '90834 Psychotherapy' },
              ]}
              placeholder="CPT Code"
            />
          </div>
        </div>
      )}

      {sessionMode === 'upload' && (
        <section>
          <h2 className="font-medium mb-2">Upload Audio</h2>
          <FileUploader onFileChange={files => { fileUploadRef.current = files; }} />
        </section>
      )}

      {sessionMode === 'describe' && (
        <section>
          <h2 className="font-medium mb-2">Describe Session</h2>
          <textarea
            className="w-full p-2 border rounded"
            rows={6}
            placeholder="Type your session notes..."
          />
        </section>
      )}

      <button
        onClick={handleStartSession}
        className="w-full py-3 bg-[#92C7CF] text-white rounded hover:bg-[#82b7bf]"
      >
        Start Session
      </button>
    </div>
  );
};

export default SessionPage;