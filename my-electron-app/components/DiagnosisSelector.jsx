import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Inbox } from 'lucide-react';

const DiagnosisSelector = ({ value, onChange, patientId }) => {
  const [availableCodes, setAvailableCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState(value ? [value] : []);
  const dropdownRef = useRef(null);
  
  // Common ICD-10 codes for mental health
  const commonCodes = [
    { id: 'F32.9', code: 'F32.9', name: 'Major depressive disorder, single episode, unspecified' },
    { id: 'F33.1', code: 'F33.1', name: 'Major depressive disorder, recurrent, moderate' },
    { id: 'F41.1', code: 'F41.1', name: 'Generalized anxiety disorder' },
    { id: 'F43.10', code: 'F43.10', name: 'Post-traumatic stress disorder, unspecified' },
    { id: 'F43.23', code: 'F43.23', name: 'Adjustment disorder with mixed anxiety and depressed mood' },
    { id: 'F60.9', code: 'F60.9', name: 'Personality disorder, unspecified' },
    { id: 'F90.9', code: 'F90.9', name: 'Attention-deficit hyperactivity disorder, unspecified type' },
    { id: 'F42.2', code: 'F42.2', name: 'Mixed obsessional thoughts and acts' }
  ];
  
  // Group the codes by category
  const groupedCodes = {
    'Common Mental Health Codes': commonCodes,
    'Recent Diagnoses': []
  };
  
  // Handle clicks outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Load additional codes or patient-specific codes if needed
  useEffect(() => {
    // This is where you would potentially fetch patient-specific diagnoses
    if (patientId) {
      setLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        // This would be replaced with actual patient diagnosis history
        const recentDiagnoses = [
          { id: 'F31.9', code: 'F31.9', name: 'Bipolar disorder, unspecified' },
          { id: 'F50.9', code: 'F50.9', name: 'Eating disorder, unspecified' }
        ];
        
        // Update grouped codes with patient-specific ones
        groupedCodes['Recent Diagnoses'] = recentDiagnoses;
        setAvailableCodes([...commonCodes, ...recentDiagnoses]);
        setLoading(false);
      }, 500);
    } else {
      setAvailableCodes(commonCodes);
    }
    
    // Initialize selected diagnoses
    if (value) {
      const diagnosis = commonCodes.find(code => code.id === value);
      if (diagnosis) {
        setSelectedDiagnoses([diagnosis]);
      }
    }
  }, [patientId, value]);
  
  // Add a diagnosis
  const handleSelectDiagnosis = (diagnosisId) => {
    const diagnosis = availableCodes.find(code => code.id === diagnosisId);
    if (diagnosis && !selectedDiagnoses.some(d => d.id === diagnosis.id)) {
      const newSelected = [...selectedDiagnoses, diagnosis];
      setSelectedDiagnoses(newSelected);
      
      // If this is the first diagnosis, update the primary value
      if (selectedDiagnoses.length === 0) {
        onChange(diagnosis.id);
      }
    }
    setIsOpen(false);
    setSearchTerm('');
  };
  
  // Remove a diagnosis
  const handleRemoveDiagnosis = (diagnosisId, e) => {
    e.stopPropagation();
    const newSelected = selectedDiagnoses.filter(d => d.id !== diagnosisId);
    setSelectedDiagnoses(newSelected);
    // Update the value (use the first remaining diagnosis or null)
    onChange(newSelected.length > 0 ? newSelected[0].id : null);
  };
  
  // Filter diagnoses based on search term
  const filteredDiagnoses = searchTerm
    ? availableCodes.filter(diagnosis => 
        diagnosis.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : availableCodes;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col space-y-1">
        <h3 className="text-sm font-medium text-gray-500">DIAGNOSIS</h3>
        
        {/* Searchable Input with Chips */}
        <div 
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#92C7CF] focus-within:border-[#92C7CF] cursor-text flex flex-wrap items-center min-h-[42px]"
          onClick={() => setIsOpen(true)}
        >
          {/* Search icon */}
          <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          
          {/* Selected diagnoses as chips */}
          {selectedDiagnoses.map(diagnosis => (
            <div 
              key={diagnosis.id}
              className="inline-flex items-center mr-2 mb-1 mt-1 bg-blue-50 text-blue-800 rounded-full px-2 py-1 text-sm"
            >
              <span className="mr-1 truncate max-w-[200px]">{diagnosis.name}</span>
              <button 
                onClick={(e) => handleRemoveDiagnosis(diagnosis.id, e)}
                className="text-blue-500 hover:text-blue-700 focus:outline-none"
                style={{ background: 'none', border: 'none' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {/* Input field */}
          <input
            type="text"
            className="flex-grow py-1 outline-none bg-transparent"
            placeholder={selectedDiagnoses.length > 0 ? "" : "Search ICD-10 codes..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          />
        </div>
        
        {/* Dropdown panel */}
        {isOpen && (
          <div 
            className="absolute top-full left-0 z-10 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto outline-none"
            style={{
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
          >
            {filteredDiagnoses.length > 0 ? (
              <ul className="py-1">
                {filteredDiagnoses.map((diagnosis) => (
                  <li key={diagnosis.id}>
                    <button
                      type="button"
                      className="flex items-center justify-between w-full text-left px-4 py-2.5 bg-white hover:bg-gray-200 focus:outline-none"
                      onClick={() => handleSelectDiagnosis(diagnosis.id)}
                    >
                      <span className="block text-sm text-gray-900">{diagnosis.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center">
                <div className="inline-block p-3 bg-gray-100 rounded-full mb-2">
                  <Inbox className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No matching diagnoses found</p>
              </div>
            )}
          </div>
        )}
        
        {loading && (
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading patient diagnoses...
          </div>
        )}
        
        <div className="mt-1">
        </div>
      </div>
    </div>
  );
};

export default DiagnosisSelector;