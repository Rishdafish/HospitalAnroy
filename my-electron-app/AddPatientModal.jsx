import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddPatientModal = ({ onClose, onAddPatient, onUpdatePatient, patientToEdit = null }) => {
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    category: 'individual',
    pronouns: 'neutral',
    icdCode: '',
    diagnosis: '',
    diagnoses: [], // Array of diagnoses with codes
    referAs: 'client',
    language: 'english'
  });
  
  // If editing an existing patient, populate the form
  useEffect(() => {
    if (patientToEdit) {
      setPatientData({
        ...patientToEdit
      });
    }
  }, [patientToEdit]);

  // Sample ICD-10 diagnoses
  const diagnosisList = [
    { id: 'F32.9', code: 'F32.9', name: 'Major depressive disorder, single episode, unspecified' },
    { id: 'F41.1', code: 'F41.1', name: 'Generalized anxiety disorder' },
    { id: 'F43.10', code: 'F43.10', name: 'Post-traumatic stress disorder, unspecified' },
    { id: 'F41.9', code: 'F41.9', name: 'Anxiety disorder, unspecified' },
    { id: 'F33.1', code: 'F33.1', name: 'Major depressive disorder, recurrent, moderate' },
    { id: 'F60.3', code: 'F60.3', name: 'Borderline personality disorder' },
    { id: 'F90.9', code: 'F90.9', name: 'Attention-deficit hyperactivity disorder, unspecified type' },
    { id: 'F42.2', code: 'F42.2', name: 'Mixed obsessional thoughts and acts' },
    { id: 'F31.9', code: 'F31.9', name: 'Bipolar disorder, unspecified' },
    { id: 'F50.9', code: 'F50.9', name: 'Eating disorder, unspecified' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => ({ ...prev, [name]: value }));
  };
  
  // Add a diagnosis to the patient
  const handleAddDiagnosis = (diagnosisId) => {
    const selectedDiagnosis = diagnosisList.find(d => d.id === diagnosisId);
    if (selectedDiagnosis && !patientData.diagnoses.some(d => d.id === diagnosisId)) {
      const updatedDiagnoses = [...patientData.diagnoses, selectedDiagnosis];
      // Update diagnoses array
      setPatientData(prev => ({ 
        ...prev, 
        diagnoses: updatedDiagnoses,
        // Set the main diagnosis and ICD code if this is the first one
        diagnosis: updatedDiagnoses.length === 1 ? selectedDiagnosis.name : prev.diagnosis,
        icdCode: updatedDiagnoses.length === 1 ? selectedDiagnosis.code : prev.icdCode
      }));
    }
  };
  
  // Remove a diagnosis from the patient
  const handleRemoveDiagnosis = (diagnosisId) => {
    const updatedDiagnoses = patientData.diagnoses.filter(d => d.id !== diagnosisId);
    setPatientData(prev => ({ 
      ...prev, 
      diagnoses: updatedDiagnoses,
      // Update main diagnosis and ICD code if needed
      diagnosis: updatedDiagnoses.length > 0 ? updatedDiagnoses[0].name : '',
      icdCode: updatedDiagnoses.length > 0 ? updatedDiagnoses[0].code : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (patientToEdit) {
      // Update existing patient
      const updatedPatient = {
        ...patientToEdit,
        ...patientData,
        dob: calculateDOB(patientData.age),
        initial: patientData.name.charAt(0).toUpperCase(),
      };
      
      onUpdatePatient(updatedPatient);
    } else {
      // Add new patient
      const newPatient = {
        ...patientData,
        id: Date.now().toString(), // Simple unique ID
        dob: calculateDOB(patientData.age),
        initial: patientData.name.charAt(0).toUpperCase(),
        lastSession: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      
      onAddPatient(newPatient);
    }
    
    onClose();
  };
  
  // Calculate approximate DOB from age
  const calculateDOB = (age) => {
    const today = new Date();
    const birthYear = today.getFullYear() - parseInt(age);
    return `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${birthYear}`;
  };

  // Determine gender based on pronouns
  const getGenderDisplay = (pronouns) => {
    switch(pronouns) {
      case 'him': return 'Male (he/him)';
      case 'her': return 'Female (she/her)';
      default: return 'Non-binary (they/them)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-800">Add New Patient</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Patient Name"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm"
                value={patientData.name}
                onChange={handleChange}
                style={{
                  backgroundColor: "white"
                }}
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                required
                placeholder="Age"
                min="1"
                max="120"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm"
                value={patientData.age}
                onChange={handleChange}
                style={{
                  backgroundColor: "white"
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                className="w-full pl-3 pr-10 py-3 text-base border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm rounded-md appearance-none"
                value={patientData.category}
                onChange={handleChange}
                style={{
                  backgroundColor: "white"
                }}
              >
                <option value="individual">Individual</option>
                <option value="relationship">Relationship</option>
                <option value="family">Family</option>
                <option value="group">Group</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#92C7CF]">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Pronouns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pronouns
              </label>
              <select
                name="pronouns"
                className="w-full pl-3 pr-10 py-3 text-base border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm rounded-md appearance-none"
                value={patientData.pronouns}
                onChange={handleChange}
                style={{
                  backgroundColor: "white"
                }}
              >
                <option value="neutral">Neutral (they/them)</option>
                <option value="him">Him (he/him)</option>
                <option value="her">Her (she/her)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#92C7CF]">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Multi-select Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnoses
              </label>
              <div className="relative">
                {/* Diagnosis Searchable Input with Chips */}
                <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#92C7CF] focus-within:border-[#92C7CF] min-h-[42px] flex flex-wrap items-center">
                  {/* Show selected diagnoses as chips */}
                  {patientData.diagnoses.map(diagnosis => (
                    <div 
                      key={diagnosis.id}
                      className="inline-flex items-center mr-2 mb-1 mt-1 bg-blue-50 text-blue-800 rounded-full px-2 py-1 text-sm"
                    >
                      <span className="mr-1 truncate max-w-[200px]">{diagnosis.name}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveDiagnosis(diagnosis.id)}
                        className="text-blue-500 hover:text-blue-700 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Dropdown Trigger */}
                  <div className="flex-grow">
                    <select
                      name="diagnosis-selector"
                      className="w-full bg-transparent border-0 focus:outline-none py-1"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddDiagnosis(e.target.value);
                          e.target.value = ""; // Reset select value after selection
                        }
                      }}
                    >
                      <option value="">Add diagnosis...</option>
                      {diagnosisList
                        .filter(d => !patientData.diagnoses.some(pd => pd.id === d.id))
                        .map(diagnosis => (
                          <option key={diagnosis.id} value={diagnosis.id}>
                            {diagnosis.name} ({diagnosis.code})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  Selected diagnoses: {patientData.diagnoses.length > 0 ? patientData.diagnoses.length : 'None'}
                </div>
              </div>
            </div>

            {/* ICD-10 Code - Auto-filled from diagnosis selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ICD-10 Code
              </label>
              <input
                type="text"
                name="icdCode"
                placeholder="ICD-10 Code"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm bg-gray-100"
                value={patientData.icdCode}
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled from diagnosis selection</p>
            </div>

            {/* Refer As */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refer to client as
              </label>
              <select
                name="referAs"
                className="w-full pl-3 pr-10 py-3 text-base border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm rounded-md appearance-none"
                value={patientData.referAs}
                onChange={handleChange}
                style={{
                  backgroundColor: "white"
                }}
              >
                <option value="client">Client</option>
                <option value="patient">Patient</option>
                <option value="individual">Individual</option>
                <option value="member">Member</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#92C7CF]">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                name="language"
                className="w-full pl-3 pr-10 py-3 text-base border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm rounded-md appearance-none"
                value={patientData.language}
                onChange={handleChange}
                style={{
                  backgroundColor: "white"
                }}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#92C7CF]">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              style={{backgroundColor: 'white', color: '#333', border: '1px solid #ddd'}}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#92C7CF] text-white rounded-md hover:bg-[#82b7bf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AAD7D9]"
              style={{backgroundColor: '#92C7CF', color: 'white', fontWeight: 'bold'}}
            >
              {patientToEdit ? 'Update Patient' : 'Add Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;