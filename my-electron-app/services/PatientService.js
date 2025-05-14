/**
 * PatientService - Manages patient data across the application
 * Acts as a central store for patients and provides methods to manipulate the data
 */

// Initial sample data
const initialPatients = [
  {
    id: '1',
    name: 'John Doe',
    initial: 'J',
    gender: 'Male (he/him)',
    age: 32,
    dob: '05-15-1993',
    icdCode: 'F41.1',
    diagnosis: 'Generalized anxiety disorder',
    lastSession: 'Apr 8, 2025',
    category: 'individual',
    pronouns: 'him',
    referAs: 'client',
    language: 'english'
  },
  {
    id: '2',
    name: 'Jane Smith',
    initial: 'J',
    gender: 'Female (she/her)',
    age: 28,
    dob: '09-22-1997',
    icdCode: 'F33.1',
    diagnosis: 'Major depressive disorder, recurrent, moderate',
    lastSession: 'Apr 7, 2025',
    category: 'individual',
    pronouns: 'her',
    referAs: 'client',
    language: 'english'
  },
  {
    id: '3',
    name: 'Alex Johnson',
    initial: 'A',
    gender: 'Non-binary (they/them)',
    age: 45,
    dob: '11-03-1980',
    icdCode: 'F43.2',
    diagnosis: 'Post-traumatic stress disorder, unspecified',
    lastSession: 'Apr 5, 2025',
    category: 'individual',
    pronouns: 'neutral',
    referAs: 'client',
    language: 'english'
  }
];

class PatientService {
  constructor() {
    // Initialize with sample data or load from localStorage
    this.patients = [...initialPatients];
    this.subscribers = [];
    
    // Try to load from localStorage if available
    this.loadFromStorage();
  }

  // Load patients from localStorage if available
  loadFromStorage() {
    try {
      const storedPatients = localStorage.getItem('patients');
      if (storedPatients) {
        this.patients = JSON.parse(storedPatients);
      }
    } catch (error) {
      console.error('Error loading patients from storage:', error);
    }
  }

  // Save patients to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('patients', JSON.stringify(this.patients));
    } catch (error) {
      console.error('Error saving patients to storage:', error);
    }
  }

  // Get all patients
  getPatients() {
    return [...this.patients];
  }

  // Get a single patient by ID
  getPatient(id) {
    return this.patients.find(patient => patient.id === id) || null;
  }

  // Add a new patient
  addPatient(patient) {
    this.patients.push(patient);
    this.notifySubscribers();
    this.saveToStorage();
    return patient;
  }

  // Update an existing patient
  updatePatient(id, updatedData) {
    const index = this.patients.findIndex(patient => patient.id === id);
    if (index !== -1) {
      this.patients[index] = { ...this.patients[index], ...updatedData };
      this.notifySubscribers();
      this.saveToStorage();
      return this.patients[index];
    }
    return null;
  }

  // Delete a patient
  deletePatient(id) {
    const index = this.patients.findIndex(patient => patient.id === id);
    if (index !== -1) {
      this.patients.splice(index, 1);
      this.notifySubscribers();
      this.saveToStorage();
      return true;
    }
    return false;
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
const patientServiceInstance = new PatientService();

export default patientServiceInstance;