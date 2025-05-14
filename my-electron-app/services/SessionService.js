/**
 * SessionService - Manages session data across the application
 * Connects patient data, templates, and enables session creation
 */

// Import other services
import PatientService from './PatientService';
import TemplateService from './TemplateService';

// Initial sample sessions
const initialSessions = [
  {
    id: '1',
    patientId: '1',
    sessionType: 'therapy',
    date: 'Apr 8, 2025',
    startTime: '9:00 AM',
    endTime: '9:50 AM',
    duration: '50 minutes',
    templateId: '1',
    notes: 'Patient presented with symptoms of anxiety. Discussed coping mechanisms and scheduled follow-up.',
    cptCode: '90834',
    status: 'completed'
  },
  {
    id: '2',
    patientId: '2',
    sessionType: 'intake',
    date: 'Apr 7, 2025',
    startTime: '10:00 AM',
    endTime: '10:50 AM',
    duration: '50 minutes',
    templateId: '2',
    notes: 'Initial assessment completed. Treatment plan established focusing on depression management.',
    cptCode: '90791',
    status: 'completed'
  }
];

class SessionService {
  constructor() {
    // Initialize with sample data or load from localStorage
    this.sessions = [...initialSessions];
    this.subscribers = [];
    
    // Try to load from localStorage if available
    this.loadFromStorage();
  }

  // Load sessions from localStorage if available
  loadFromStorage() {
    try {
      const storedSessions = localStorage.getItem('sessions');
      if (storedSessions) {
        this.sessions = JSON.parse(storedSessions);
      }
    } catch (error) {
      console.error('Error loading sessions from storage:', error);
    }
  }

  // Save sessions to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('sessions', JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error saving sessions to storage:', error);
    }
  }

  // Get all sessions
  getSessions() {
    return [...this.sessions];
  }

  // Get a single session by ID
  getSession(id) {
    return this.sessions.find(session => session.id === id) || null;
  }

  // Get sessions for a specific patient
  getPatientSessions(patientId) {
    // Check if patient exists
    const patientExists = PatientService.getPatient(patientId);
    if (!patientExists) {
      return []; // Return empty array if patient doesn't exist anymore
    }
    // Filter out any sessions marked as 'hidden'
    return this.sessions.filter(session => 
      session.patientId === patientId && session.status !== 'hidden'
    );
  }

  // Get enriched session data (with patient and template info)
  getEnrichedSessions() {
    return this.sessions
      .filter(session => {
        // Filter out sessions for deleted patients
        const patient = PatientService.getPatient(session.patientId);
        return patient !== null;
      })
      .map(session => {
        const patient = PatientService.getPatient(session.patientId);
        const template = session.templateId ? TemplateService.getTemplate(session.templateId) : null;
        return {
          ...session,
          patient: {
            name: patient.name,
            initial: patient.initial
          },
          templateName: template ? template.name : null
        };
      });
  }

  // Add a new session
  addSession(session) {
    const newSession = {
      ...session,
      // Generate unique ID with timestamp + random number to avoid duplicates
      id: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      status: session.status || 'scheduled'
    };
    
    this.sessions.push(newSession);
    this.notifySubscribers();
    this.saveToStorage();
    return newSession;
  }

  // Update an existing session
  updateSession(id, updatedData) {
    const index = this.sessions.findIndex(session => session.id === id);
    if (index !== -1) {
      this.sessions[index] = { ...this.sessions[index], ...updatedData };
      this.notifySubscribers();
      this.saveToStorage();
      return this.sessions[index];
    }
    return null;
  }

  // Delete a session
  deleteSession(id) {
    const index = this.sessions.findIndex(session => session.id === id);
    if (index !== -1) {
      this.sessions.splice(index, 1);
      this.notifySubscribers();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Directly get template content from database
  getTemplateContentById(templateId) {
    console.log("📝 [SessionService] getTemplateContentById called with ID:", templateId);
    
    // Handle both prefixed and non-prefixed IDs
    const rawTemplateId = templateId.startsWith('template_') ? templateId.replace('template_', '') : templateId;
    
    // First try the live cache in the template service
    console.log("📝 [SessionService] Trying to get template from TemplateService cache");
    const cachedTemplate = TemplateService.getTemplateSync(templateId);
    console.log("📝 [SessionService] Cache result:", cachedTemplate ? "Found" : "Not found");
    
    if (cachedTemplate) {
      console.log("📝 [SessionService] Cached template found, has format:", !!cachedTemplate.format);
      if (cachedTemplate.format) {
        console.log("📝 [SessionService] Format content (first 50 chars):", 
          cachedTemplate.format.substring(0, 50));
        return cachedTemplate.format;
      }
    }
    
    // Try with raw template ID if template wasn't found with prefixed ID
    if (templateId !== rawTemplateId) {
      console.log("📝 [SessionService] Trying again with raw ID:", rawTemplateId);
      const rawTemplate = TemplateService.getTemplateSync(rawTemplateId);
      console.log("📝 [SessionService] Raw ID result:", rawTemplate ? "Found" : "Not found");
      
      if (rawTemplate && rawTemplate.format) {
        console.log("📝 [SessionService] Raw template found, has format:", !!rawTemplate.format);
        console.log("📝 [SessionService] Format content (first 50 chars):", 
          rawTemplate.format.substring(0, 50));
        return rawTemplate.format;
      }
    }
    
    // If not in cache, try to load directly from database
    console.log("📝 [SessionService] Trying direct database access...");
    try {
      // Access local storage directly to get templates
      const dbStr = localStorage.getItem('database.db');
      console.log("📝 [SessionService] database.db in localStorage:", !!dbStr);
      
      if (dbStr) {
        const dbData = JSON.parse(dbStr);
        console.log("📝 [SessionService] database.db parsed, has templates:", 
          !!(dbData && dbData.templates));
          
        if (dbData && dbData.templates) {
          console.log("📝 [SessionService] Templates array length:", dbData.templates.length);
          console.log("📝 [SessionService] Template IDs in database:", 
            dbData.templates.map(t => t.id));
          
          const template = dbData.templates.find(t => t.id === templateId);
          console.log("📝 [SessionService] Template match found:", !!template);
          
          if (template) {
            console.log("📝 [SessionService] Template has format:", !!template.format);
            console.log("📝 [SessionService] Template name:", template.name);
            
            if (template.format) {
              console.log("📝 [SessionService] Format content (first 50 chars):", 
                template.format.substring(0, 50));
              return template.format;
            } else {
              console.error("📝 [SessionService] Template found but format is empty or missing");
            }
          }
        }
      }
    } catch (error) {
      console.error("📝 [SessionService] Error accessing template directly:", error);
    }
    
    // Last resort: check all storage for any matching templates
    console.log("📝 [SessionService] LAST RESORT: Checking all localStorage keys");
    try {
      console.log("📝 [SessionService] All localStorage keys:", Object.keys(localStorage));
      
      // Try alternative storage locations
      const templatesStr = localStorage.getItem('templates');
      if (templatesStr) {
        console.log("📝 [SessionService] Found 'templates' in localStorage");
        try {
          const templates = JSON.parse(templatesStr);
          console.log("📝 [SessionService] Parsed templates array:", templates.length);
          
          const template = templates.find(t => t.id === templateId);
          if (template && template.format) {
            console.log("📝 [SessionService] Found template in alternative storage");
            return template.format;
          }
        } catch (e) {
          console.error("📝 [SessionService] Error parsing templates from localStorage", e);
        }
      }
    } catch (e) {}
    
    console.warn("📝 [SessionService] Template not found anywhere, ID:", templateId);
    return null;
  }

  // Start a live session
  startLiveSession(data) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    const formattedTime = currentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Get patient data
    const patient = PatientService.getPatient(data.patientId);
    
    // Prepare note content based on template if provided
    let notes = '';
    
    // Check if it's a custom template
    if (data.templateId && data.templateId.startsWith('template_')) {
      const templateId = data.templateId.replace('template_', '');
      
      // Get the actual content - try direct database access first
      const templateContent = this.getTemplateContentById(templateId);
      
      if (templateContent) {
        // Replace template placeholders with patient data if available
        let content = templateContent;
        
        if (patient) {
          // Get formatted diagnosis text
          let diagnosisText = '';
          
          // Check if patient has multiple diagnoses
          if (patient.diagnoses && Array.isArray(patient.diagnoses) && patient.diagnoses.length > 0) {
            // Format the multiple diagnoses into a clean, simplified string
            diagnosisText = patient.diagnoses.map(d => {
              // Take just the primary condition part (before any commas)
              const simplifiedName = d.name.split(',')[0].trim();
              return simplifiedName;
            }).join('; ');
          } else if (patient.icdCode) {
            // For backward compatibility with single diagnoses
            // Search for the diagnosis corresponding to the ICD code
            const allCodes = [
              { id: 'F32.9', name: 'Major depressive disorder' },
              { id: 'F33.1', name: 'Major depressive disorder, recurrent' },
              { id: 'F41.1', name: 'Generalized anxiety disorder' },
              { id: 'F43.10', name: 'Post-traumatic stress disorder' },
              { id: 'F43.23', name: 'Adjustment disorder' },
              { id: 'F60.9', name: 'Personality disorder' },
              { id: 'F90.9', name: 'ADHD' },
              { id: 'F42.2', name: 'OCD' },
              { id: 'F31.9', name: 'Bipolar disorder' },
              { id: 'F50.9', name: 'Eating disorder' }
            ];
            
            const diagnosisEntry = allCodes.find(item => item.id === patient.icdCode);
            diagnosisText = diagnosisEntry ? diagnosisEntry.name : (patient.diagnosis || '').split(',')[0].trim();
          } else {
            // Default fallback
            diagnosisText = patient.diagnosis ? patient.diagnosis.split(',')[0].trim() : '';
          }
          
          content = content
            .replace(/\[DATE\]/g, formattedDate)
            .replace(/\[START TIME\]/g, formattedTime)
            .replace(/\[NAME\]/g, patient.name || '')
            .replace(/\[CLIENT NAME\]/g, patient.name || '')
            .replace(/\[DOB\]/g, patient.dob || '')
            .replace(/\[DIAGNOSIS\]/g, diagnosisText);
            
          // Additional common placeholders
          content = content
            .replace(/\[AGE\]/g, patient.age || '')
            .replace(/\[GENDER\]/g, patient.gender || '')
            .replace(/\[END TIME\]/g, '') // Will be filled in later
            .replace(/\[LENGTH\]/g, '') // Will be filled in later
            .replace(/\[ICD-10\]/g, patient.icdCode || '');
        }
        
        notes = content;
      } else {
        console.error(`Template content not found for ID: ${templateId}`);
        notes = "Template content could not be loaded.";
      }
    } else if (data.sessionType === 'dap') {
      // Default DAP template with PLAN section prefilled
      notes = `DATA:\n\n\nASSESSMENT:\n\n\nPLAN:\nHello world\n`;
    } else if (data.sessionType === 'soap') {
      notes = `SUBJECTIVE:\n\n\nOBJECTIVE:\n\n\nASSESSMENT:\n\n\nPLAN:\n`;
    }
    
    const newSession = {
      patientId: data.patientId,
      sessionType: data.sessionType || 'therapy',
      date: formattedDate,
      startTime: formattedTime,
      templateId: data.templateId,
      status: 'in-progress',
      notes: notes,
      cptCode: data.cptCode || '',
      title: data.title || '' // Store the custom title
    };
    
    return this.addSession(newSession);
  }

  // End a live session
  endLiveSession(id, notes) {
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const session = this.getSession(id);
    if (!session) return null;
    
    // Calculate duration
    const startTime = new Date(`01/01/2000 ${session.startTime}`);
    const endTime = new Date(`01/01/2000 ${currentTime}`);
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    const updatedData = {
      endTime: currentTime,
      duration: `${durationMinutes} minutes`,
      notes: notes || session.notes,
      status: 'completed'
    };
    
    return this.updateSession(id, updatedData);
  }

  // Subscribe to changes
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers of changes
  notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }
}

// Create a singleton instance
const sessionServiceInstance = new SessionService();

export default sessionServiceInstance;