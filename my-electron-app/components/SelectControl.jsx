import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

const SelectControl = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select option', 
  label = '',
  optional = false,
  backgroundColor = 'white',
  searchable = false,
  groupedOptions = null
}) => {
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
    if (!value) return placeholder;
    const selectedOption = options.find(opt => opt.id === value);
    return selectedOption ? selectedOption.name : placeholder;
  };
  
  // Handle selecting an option
  const handleSelect = (optionId) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Filter options based on search term if searchable
  const filteredOptions = searchable && searchTerm
    ? options.filter(opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;
  
  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Label if provided */}
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          {optional && (
            <span className="text-xs text-gray-500">optional</span>
          )}
        </div>
      )}
      
      {/* Selected display / trigger button */}
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: value ? backgroundColor : "white",
          textAlign: "left",
          borderRadius: "8px",
          transition: "all 0.2s ease"
        }}
      >
        <span className={`block truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
          {getDisplayName()}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto border border-gray-200"
          style={{
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          }}
        >

          {/* Option list */}
          {groupedOptions ? (
            // Grouped options
            <div>
              {Object.entries(groupedOptions).map(([group, opts]) => (
                <div key={group}>
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{group}</h3>
                  </div>
                  <ul className="py-1">
                    {opts.map((option) => (
                      <li key={option.id}>
                        <button
                          type="button"
                          className={`flex items-center justify-between w-full px-4 py-3 text-black hover:bg-gray-100 focus:outline-none ${value === option.id ? 'bg-gray-50' : 'bg-white'}`}
                          onClick={() => handleSelect(option.id)}
                        >
                          <div className="flex-1">
                            <span className="block text-sm font-medium text-gray-900">{option.name}</span>
                            {option.description && (
                              <span className="block text-xs text-gray-500">{option.description}</span>
                            )}
                          </div>
                          {value === option.id && (
                            <Check className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            // Regular flat list
            <ul className="py-1">
              {filteredOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-black hover:bg-gray-100 focus:outline-none ${value === option.id ? 'bg-gray-50' : 'bg-white'}`}
                    onClick={() => handleSelect(option.id)}
                  >
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-gray-900">{option.name}</span>
                      {option.description && (
                        <span className="block text-xs text-gray-500">{option.description}</span>
                      )}
                    </div>
                    {value === option.id && (
                      <Check className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Empty state */}
          {filteredOptions.length === 0 && searchTerm && (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">
              <div className="inline-block bg-gray-100 rounded-full p-3 mb-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p>No matching options found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectControl;