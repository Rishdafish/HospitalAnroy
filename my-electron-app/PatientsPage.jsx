import React, { useState, useEffect } from 'react';
import { 
  Search, 
  PenSquare as Edit, 
  Trash, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Mic 
} from 'lucide-react';
import AddPatientModal from './AddPatientModal';

// Import the PatientService
import PatientService from './services/PatientService';

const PatientsPage = () => {
  // Get patients from service
  const [patients, setPatients] = useState(PatientService.getPatients());
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Keep local state in sync with PatientService
  useEffect(() => {
    // Subscribe to changes in the patient list
    const unsubscribe = PatientService.subscribe(() => {
      setPatients(PatientService.getPatients());
    });
    
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Add a new patient
  const handleAddPatient = (newPatient) => {
    PatientService.addPatient(newPatient);
    setSuccessMessage('Patient added successfully!');
    
    // Clear success message after a delay
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Delete a patient
  const handleDeletePatient = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      PatientService.deletePatient(id);
      setSuccessMessage('Patient deleted successfully!');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };
  
  // Edit a patient
  const [patientToEdit, setPatientToEdit] = useState(null);
  
  const handleEditPatient = (id) => {
    const patient = PatientService.getPatient(id);
    if (patient) {
      setPatientToEdit(patient);
      setShowAddModal(true);
    }
  };
  
  // Update a patient
  const handleUpdatePatient = (updatedPatient) => {
    PatientService.updatePatient(updatedPatient.id, updatedPatient);
    setSuccessMessage('Patient updated successfully!');
    setPatientToEdit(null);
    
    // Clear success message after a delay
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // Filtering patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Updated Top Left Button */}
            <button 
              className="mr-3 bg-white text-black outline-none focus:outline-none hover:bg-white"
              onClick={() => window.location.hash = '/'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 tracking-wide">SUNDER</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Your Patients</span>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow">
          {/* Search and Action Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search patients"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center space-x-4">
              {/* Updated Add Patient Button */}
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center rounded-full border border-blue-300 bg-blue-100 text-black px-4 py-2 transition-colors duration-200 hover:bg-white hover:border-gray-400"
              >
                Add Patient
              </button>
            </div>
          </div>
          
          {/* Patients Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DOB
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last session <ChevronDown className="inline h-4 w-4" />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className={`flex-shrink-0 h-10 w-10 rounded-full ${
                            ['A', 'E', 'I', 'O', 'U'].includes(patient.initial) ? 'bg-blue-200' :
                            ['B', 'C', 'D', 'F', 'G'].includes(patient.initial) ? 'bg-green-200' :
                            ['H', 'J', 'K', 'L', 'M'].includes(patient.initial) ? 'bg-purple-200' :
                            ['N', 'P', 'Q', 'R', 'S'].includes(patient.initial) ? 'bg-amber-200' :
                            'bg-pink-200'
                          } flex items-center justify-center cursor-pointer`}
                          style={{ aspectRatio: '1/1' }}
                          onClick={() => window.location.hash = `/patient/${patient.id}`}
                        >
                          <span className="text-sm font-medium">{patient.initial}</span>
                        </div>
                        <div className="ml-4">
                          <div 
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-[#92C7CF]"
                            onClick={() => window.location.hash = `/patient/${patient.id}`}
                          >
                            {patient.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.gender}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.age}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.dob}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.diagnoses && patient.diagnoses.length > 0 ? (
                          <div className="flex flex-col">
                            {patient.diagnoses.slice(0, 2).map(diagnosis => (
                              <span key={diagnosis.id} className="text-xs inline-flex items-center">
                                <span className="font-medium mr-1">{diagnosis.name.split(',')[0]}</span>
                                <span className="text-gray-500 text-xs">({diagnosis.code})</span>
                              </span>
                            ))}
                            {patient.diagnoses.length > 2 && (
                              <span className="text-xs text-gray-500">+{patient.diagnoses.length - 2} more</span>
                            )}
                          </div>
                        ) : patient.diagnosis ? (
                          <span className="text-xs">
                            <span className="font-medium">{patient.diagnosis.split(',')[0]}</span>
                            {patient.icdCode && <span className="text-gray-500 ml-1">({patient.icdCode})</span>}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">No diagnosis</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.lastSession}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {/* Edit Button */}
                        <button 
                          onClick={() => handleEditPatient(patient.id)}
                          className="bg-transparent border-none outline-none focus:outline-none text-black hover:text-gray-500 hover:bg-transparent"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {/* Trash Button */}
                        <button 
                          onClick={() => handleDeletePatient(patient.id)}
                          className="bg-transparent border-none outline-none focus:outline-none text-black hover:text-orange-500 hover:bg-transparent"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">Items per page:</span>
              <select 
                className="border border-gray-300 rounded px-2 py-1"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                1-{filteredPatients.length} of {filteredPatients.length}
              </span>
              <nav className="flex items-center">
                <button className="px-2 py-1 bg-transparent text-black hover:bg-transparent">
                  <ChevronsLeft className="h-5 w-5" />
                </button>
                <button className="px-2 py-1 bg-transparent text-black hover:bg-transparent">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="px-2 py-1 bg-transparent text-black hover:bg-transparent">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button className="px-2 py-1 bg-transparent text-black hover:bg-transparent">
                  <ChevronsRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Patient Modal */}
      {showAddModal && (
        <AddPatientModal 
          onClose={() => {
            setShowAddModal(false);
            setPatientToEdit(null);
          }} 
          onAddPatient={handleAddPatient}
          onUpdatePatient={handleUpdatePatient}
          patientToEdit={patientToEdit}
        />
      )}
    </div>
  );
};

export default PatientsPage;