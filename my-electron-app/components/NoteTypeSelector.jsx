import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, FileText } from 'lucide-react';
import TemplateService from '../services/TemplateService';

const NoteTypeSelector = ({ value, onChange, noteTypes }) => {
  // Load custom templates from template service
  const [customTemplates, setCustomTemplates] = useState([]);
  
  useEffect(() => {
    // Get templates from service
    const templates = TemplateService.getTemplates();
    
    // Convert to the format needed for the selector
    // Don't filter out templates that are already in noteTypes - we need to preserve them
    const formattedTemplates = templates.map(template => ({
      id: `template_${template.id}`,
      name: template.name,
      isCustom: true
    }));
    
    setCustomTemplates(formattedTemplates);
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
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
  
  // Get the display name for the current value
  const getDisplayName = () => {
    if (!value) return 'Select a note type';
    
    // Check in standard types
    const selectedType = noteTypes.find(type => type.id === value);
    if (selectedType) return selectedType.name;
    
    // Check in custom templates
    if (value.startsWith('template_')) {
      const templateId = value.replace('template_', '');
      const template = TemplateService.getTemplate(templateId);
      if (template) return template.name;
    }
    
    return 'Select a note type';
  };
  
  // Keep only standard note types in main list since templates will be shown separately
  const allNoteTypes = [...noteTypes];
  
  // No filtering needed since search is removed
  const filteredNoteTypes = allNoteTypes;
  
  // Separate built-in note types and custom templates for display
  // Only show built-in note types that don't have isCustom property
  const builtInTypes = filteredNoteTypes.filter(type => !type.isCustom);
  const customTypes = customTemplates;
  
  // Handle selecting a note type
  const handleSelect = (typeId) => {
    onChange(typeId);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected display / trigger button */}
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: "white",
          textAlign: "left",
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          transition: 'all 0.2s ease',
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <span className={`block truncate ${value ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
          {getDisplayName()}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-hidden border border-gray-200" 
          style={{
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          
          <div className="max-h-72 overflow-y-auto">
            {/* Show custom templates first */}
            {customTypes.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Custom Templates</h3>
                </div>
                <ul className="py-1">
                  {customTypes.map((type) => (
                    <li key={type.id}>
                      <button
                        type="button"
                        className={`flex items-center justify-between w-full px-4 py-3 text-black hover:bg-gray-100 focus:outline-none ${value === type.id ? 'bg-gray-50' : 'bg-white'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(type.id);
                        }}
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div className="flex items-center flex-1">
                          <FileText className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                          <div>
                            <span className="block text-sm font-medium text-black" style={{ fontSize: '16px', fontWeight: 500 }}>{type.name}</span>
                          </div>
                        </div>
                        {value === type.id && (
                          <Check className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                
                {/* Add double hyphen separator after custom templates */}
                <div className="px-4 py-2 text-center">
                  <div className="text-gray-400 font-medium">--</div>
                </div>
              </div>
            )}
            
            {/* Show built-in note types */}
            {builtInTypes.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Built-in Note Types</h3>
                </div>
                <ul className="py-1">
                  {builtInTypes.map((type) => (
                    <li key={type.id}>
                      <button
                        type="button"
                        className={`flex items-center justify-between w-full px-4 py-3 text-black hover:bg-gray-100 focus:outline-none ${value === type.id ? 'bg-gray-50' : 'bg-white'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(type.id);
                        }}
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div className="flex-1">
                          <span className="block text-sm font-medium text-black" style={{ fontSize: '16px', fontWeight: 500 }}>{type.name}</span>
                        </div>
                        {value === type.id && (
                          <Check className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {filteredNoteTypes.length === 0 && (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">
                <div className="inline-block bg-gray-100 rounded-full p-3 mb-2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p>No note types found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteTypeSelector;