import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, FileText, CheckSquare, Square, Trash, Edit as EditIcon } from 'lucide-react';
import TemplateService from './services/TemplateService';

const TemplatePage = () => {
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateFormat, setTemplateFormat] = useState('');
  const [includeCptCodes, setIncludeCptCodes] = useState(false);
  const [includeAddOnCodes, setIncludeAddOnCodes] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [templates, setTemplates] = useState([]);

  // Keep local state in sync with TemplateService
  useEffect(() => {
    // Initialize with current templates
    setTemplates(TemplateService.getTemplates());
    
    // Subscribe to changes
    const unsubscribe = TemplateService.subscribe(() => {
      const currentTemplates = TemplateService.getTemplates();
      console.log("Template update received:", currentTemplates.length, "templates");
      setTemplates(currentTemplates);
    });
    
    return () => unsubscribe();
  }, []);

  const handleCreateTemplate = async () => {
    if (!templateName || !templateFormat) return;
    
    // Parse the template format to extract structure information
    const lines = templateFormat.split('\n');
    const fields = [];
    
    // Extract fields from the template format
    for (let line of lines) {
      const placeholderMatch = line.match(/\[(.*?)\]/);
      if (placeholderMatch) {
        const placeholder = placeholderMatch[0];
        const placeholderText = placeholderMatch[1];
        let label = line.split(':')[0].trim();
        
        if (label) {
          fields.push({
            label: label,
            placeholder: placeholder,
            placeholderText: placeholderText,
            type: placeholderText.includes('ISSUES') || 
                  placeholderText.includes('PLAN') || 
                  placeholderText.includes('ASSESSMENT') ||
                  placeholderText.includes('STATUS') ? 'textarea' : 'text'
          });
        }
      }
    }
    
    // Create the template object with structure information
    const newTemplate = {
      name: templateName,
      format: templateFormat,
      includeCptCodes,
      includeAddOnCodes,
      isStructured: true,
      structure: { fields }
    };
    
    try {
      if (editingTemplateId) {
        await TemplateService.updateTemplate(editingTemplateId, newTemplate);
        setSuccessMessage('Template updated successfully and saved to database.db!');
      } else {
        await TemplateService.addTemplate(newTemplate);
        setSuccessMessage('Template created successfully and saved to database.db!');
      }
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
      setSuccessMessage('Error saving template. Please try again.');
      
      // Clear error message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };
  
  const handleEditTemplate = (template) => {
    setTemplateFormat(template.format);
    setTemplateName(template.name);
    setIncludeCptCodes(template.includeCptCodes || false);
    setIncludeAddOnCodes(template.includeAddOnCodes || false);
    setEditingTemplateId(template.id);
    setShowNewTemplateForm(true);
  };
  
  const handleDeleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      TemplateService.deleteTemplate(id);
      setSuccessMessage('Template deleted successfully!');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };
  
  const resetForm = () => {
    setShowNewTemplateForm(false);
    setTemplateName('');
    setTemplateFormat('');
    setIncludeCptCodes(false);
    setIncludeAddOnCodes(false);
    setEditingTemplateId(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a 
               href="#/"
               className="mr-3 bg-transparent text-black outline-none focus:outline-none hover:bg-transparent" 
            >
              <ChevronLeft className="w-5 h-5" />
            </a>
            <h1 className="text-xl font-bold text-gray-800 tracking-wide">Custom Templates</h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
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
          
          <h2 className="text-lg font-medium text-gray-800 mb-4">Your Templates</h2>
          
          {/* Template List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {templates.map(template => (
              <div 
                key={template.id} 
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <h3 className="font-medium text-[#92C7CF]">{template.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.format.substring(0, 100)}...
                    </p>
                    {(template.includeCptCodes || template.includeAddOnCodes) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.includeCptCodes && (
                          <span className="px-2 py-1 bg-[#f0f9fa] text-[#92C7CF] text-xs rounded-full">
                            CPT Codes
                          </span>
                        )}
                        {template.includeAddOnCodes && (
                          <span className="px-2 py-1 bg-[#f0f9fa] text-[#92C7CF] text-xs rounded-full">
                            Add-on Codes
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEditTemplate(template)}
                      className="p-1.5 bg-white text-black border border-black rounded-full hover:bg-white hover:text-gray-500"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 bg-white text-black border border-black rounded-full hover:bg-white hover:text-gray-500"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create New Template Button */}
          {!showNewTemplateForm && (
            <button
              onClick={() => setShowNewTemplateForm(true)}
              className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-400 text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:bg-blue-100 hover:border-blue-300"
              style={{backgroundColor: '#92C7CF', color: 'white', fontWeight: 'bold'}}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Template
            </button>
          )}

          {/* New Template Form */}
          {showNewTemplateForm && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6 mt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {editingTemplateId ? 'Edit Template' : 'Create New Template'}
              </h3>
              
              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter template name"
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    style={{
                       backgroundColor: "white" 
                    }}
                  />
                </div>

                {/* Template Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Format
                  </label>
                  <textarea
                    placeholder="Enter your template format with placeholders like [NAME], [DATE], etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm h-60"
                    value={templateFormat}
                    onChange={(e) => setTemplateFormat(e.target.value)}
                    style={{ resize: "vertical", minHeight: "240px", backgroundColor: "white" }}
                  />
                </div>

                {/* Checkbox Options */}
                <div className="space-y-2">
                  <div 
                    className="flex items-center space-x-2 cursor-pointer" 
                    onClick={() => setIncludeCptCodes(!includeCptCodes)}
                  >
                    {includeCptCodes ? (
                      <CheckSquare className="h-5 w-5 text-[#92C7CF]" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">Include Sunder's Suggested CPT codes for psychiatry</span>
                  </div>

                  <div 
                    className="flex items-center space-x-2 cursor-pointer" 
                    onClick={() => setIncludeAddOnCodes(!includeAddOnCodes)}
                  >
                    {includeAddOnCodes ? (
                      <CheckSquare className="h-5 w-5 text-[#92C7CF]" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">Include Sunder's psychotherapy add-on code and justifications</span>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    style={{backgroundColor: 'white', color: '#333', border: '1px solid #ddd'}}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTemplate}
                    className="px-4 py-2 bg-[#92C7CF] text-white rounded-md hover:bg-[#82b7bf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AAD7D9]"
                    style={{backgroundColor: '#92C7CF', color: 'white', fontWeight: 'bold'}}
                  >
                    {editingTemplateId ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePage;