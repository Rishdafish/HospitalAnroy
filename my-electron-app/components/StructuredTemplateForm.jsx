import React, { useState, useEffect, useRef } from 'react';
import TemplateService from '../services/TemplateService';

const StructuredTemplateForm = ({ templateId, initialValues = {}, onChange, patient }) => {
  const [template, setTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [textareaContent, setTextareaContent] = useState('');
  const templateLoaded = useRef(false);

  // Debug the incoming props and fix common issues
  useEffect(() => {
    console.log("🔍 [StructuredTemplateForm] Received props:", { 
      templateId, 
      initialValuesType: typeof initialValues,
      initialValuesIsObject: initialValues && typeof initialValues === 'object',
      hasFormValues: initialValues && initialValues.formValues,
      hasData: initialValues && initialValues.data,
      patientProvided: !!patient 
    });

    if (initialValues && initialValues.data) {
      console.log("🔍 [StructuredTemplateForm] Initial data preview:", 
        typeof initialValues.data === 'string' 
          ? initialValues.data.substring(0, 50) + '...' 
          : 'non-string data');
    }
    
    // Fix any template structure in local storage that might be missing fields array
    try {
      const dbStr = localStorage.getItem('database.db');
      if (dbStr) {
        const dbData = JSON.parse(dbStr);
        let needsUpdate = false;
        
        if (dbData && dbData.templates && Array.isArray(dbData.templates)) {
          dbData.templates.forEach(template => {
            // Fix templates without structure
            if (!template.structure) {
              console.log(`🔍 [StructuredTemplateForm] Fixing template ${template.id} - Adding missing structure`);
              template.structure = { 
                fields: [{ label: 'Content', type: 'textarea', placeholder: '[CONTENT]' }] 
              };
              needsUpdate = true;
            }
            // Fix templates with structure but empty fields
            else if (template.structure && (!template.structure.fields || !Array.isArray(template.structure.fields) || template.structure.fields.length === 0)) {
              console.log(`🔍 [StructuredTemplateForm] Fixing template ${template.id} - Adding missing fields array`);
              template.structure.fields = [{ label: 'Content', type: 'textarea', placeholder: '[CONTENT]' }];
              needsUpdate = true;
            }
          });
          
          // Save back to localStorage if we made changes
          if (needsUpdate) {
            console.log(`🔍 [StructuredTemplateForm] Updating localStorage with fixed templates`);
            localStorage.setItem('database.db', JSON.stringify(dbData));
          }
        }
      }
    } catch (e) {
      console.error("🔍 [StructuredTemplateForm] Error trying to fix templates:", e);
    }
  }, [templateId, initialValues, patient]);

  // Helper to safely parse JSON strings.
  const tryParseJSON = (jsonString) => {
    if (typeof jsonString !== 'string') return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.log("🔍 [StructuredTemplateForm] Failed to parse JSON:", jsonString.substring(0, 100));
      return null;
    }
  };

  // Track if the user has made edits - CRUCIAL to maintain user's edits
  const userHasEdited = useRef(false);
  const didInitialize = useRef(false);
  
  // Initialize content ONCE when the component first loads
  useEffect(() => {
    // Only run this effect ONE TIME on initial load
    if (didInitialize.current) {
      return;
    }
    
    console.log('🔍 [StructuredTemplateForm] INITIAL load - setting up content');
    
    let content = '';
    
    // Try to extract content from initialValues (carefully)
    if (initialValues && initialValues.data) {
      if (typeof initialValues.data === 'string') {
        try {
          // Try to parse JSON
          const parsed = tryParseJSON(initialValues.data);
          if (parsed && typeof parsed === 'object') {
            if (parsed.Content) content = parsed.Content;
            else if (parsed.content) content = parsed.content;
            else if (parsed.data) content = parsed.data;
            else content = initialValues.data;
          } else {
            content = initialValues.data;
          }
        } catch (e) {
          content = initialValues.data;
        }
      }
    }
    
    // If we have a template format, use that as a fallback
    if (!content && template && template.format) {
      content = template.format;
    }
    
    // Set content and mark as initialized
    if (content) {
      console.log('🔍 [StructuredTemplateForm] INITIAL content set, length:', content.length);
      setTextareaContent(content);
    }
    
    // Mark as initialized so we never run this again
    didInitialize.current = true;
  }, []);

  // Load the template based on templateId, but only once
  useEffect(() => {
    // NEVER update content after user has edited - crucial for maintaining user edits
    if (userHasEdited.current) {
      console.log("🔍 [StructuredTemplateForm] User has made edits, preserving content");
      return;
    }
    
    // Also don't reload if we've already loaded it once
    const templateAlreadyLoaded = templateLoaded.current && template !== null;
    if (templateAlreadyLoaded) {
      console.log("🔍 [StructuredTemplateForm] Template already loaded, skipping load");
      return;
    }
    
    const loadTemplate = async () => {
      if (!templateId) {
        console.log("🔍 [StructuredTemplateForm] No templateId provided, skipping template load");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Create a simple emergency template with form content
      if (initialValues && initialValues.data) {
        try {
          const parsed = tryParseJSON(initialValues.data);
          if (parsed) {
            const content = parsed.Content || parsed.content || '';
            console.log("🔍 [StructuredTemplateForm] Setting content from initialValues:", content.substring(0, 30));
            setTextareaContent(content);
          } else if (typeof initialValues.data === 'string') {
            setTextareaContent(initialValues.data);
          }
        } catch (e) {
          // Fallback to raw data
          if (typeof initialValues.data === 'string') {
            setTextareaContent(initialValues.data);
          }
        }
      }
      
      console.log(`🔍 [StructuredTemplateForm] Loading template with ID "${templateId}"`);
      
      // Check localStorage directly but only log results
      try {
        const dbStr = localStorage.getItem('database.db');
        if (dbStr) {
          const dbData = JSON.parse(dbStr);
          if (dbData && dbData.templates) {
            console.log(`🔍 [StructuredTemplateForm] Found ${dbData.templates.length} templates in localStorage`);
          }
        }
      } catch (e) {
        console.error("🔍 [StructuredTemplateForm] Error inspecting localStorage:", e);
      }
      
      const actualTemplateId = templateId.startsWith('template_') 
        ? templateId.replace('template_', '') 
        : templateId;
      
      if (templateId !== actualTemplateId) {
        console.log(`🔍 [StructuredTemplateForm] Converting ID from "${templateId}" to "${actualTemplateId}"`);
      }
      
      try {
        // DIRECT APPROACH: Try to find template directly in localStorage
        let templateData = null;
        const dbStr = localStorage.getItem('database.db');
        
        if (dbStr) {
          try {
            const dbData = JSON.parse(dbStr);
            if (dbData && dbData.templates) {
              // Try both original and raw ID
              let template = dbData.templates.find(t => t.id === templateId);
              if (!template) {
                template = dbData.templates.find(t => t.id === actualTemplateId);
              }
              
              if (template) {
                console.log(`🔍 [StructuredTemplateForm] SUCCESS: Found template directly in localStorage:`, template.name);
                templateData = template;
                setTemplate(template);
                
                // Initialize form values
                let newFormValues = {};
                
                if (initialValues && initialValues.data) {
                  try {
                    const parsed = tryParseJSON(initialValues.data);
                    if (parsed && typeof parsed === 'object') {
                      newFormValues = parsed;
                    } else {
                      newFormValues = { Content: initialValues.data };
                    }
                  } catch (e) {
                    newFormValues = { Content: initialValues.data || '' };
                  }
                } else if (initialValues && initialValues.formValues) {
                  newFormValues = initialValues.formValues;
                } else if (template.format) {
                  newFormValues = { Content: template.format };
                }
                
                setFormValues(newFormValues);
                setTextareaContent(template.format || '');
                
                templateLoaded.current = true;
                setLoading(false);
                return;
              } else {
                console.log(`🔍 [StructuredTemplateForm] Could not find template with ID "${templateId}" or "${actualTemplateId}" in localStorage`);
              }
            }
          } catch (e) {
            console.error("🔍 [StructuredTemplateForm] Error parsing localStorage data:", e);
          }
        }
        
        // Fallback to template service methods
        console.log("🔍 [StructuredTemplateForm] Trying TemplateService.getTemplateSync with ID:", templateId);
        templateData = TemplateService.getTemplateSync(templateId);
        
        if (!templateData && templateId !== actualTemplateId) {
          console.log("🔍 [StructuredTemplateForm] Trying TemplateService.getTemplateSync with raw ID:", actualTemplateId);
          templateData = TemplateService.getTemplateSync(actualTemplateId);
        }
        
        if (!templateData) {
          console.log("🔍 [StructuredTemplateForm] Trying TemplateService.getTemplate (async) with ID:", templateId);
          templateData = await TemplateService.getTemplate(templateId);
        }
        
        if (!templateData && templateId !== actualTemplateId) {
          console.log("🔍 [StructuredTemplateForm] Trying TemplateService.getTemplate (async) with raw ID:", actualTemplateId);
          templateData = await TemplateService.getTemplate(actualTemplateId);
        }
        
        if (templateData) {
          console.log(`🔍 [StructuredTemplateForm] SUCCESS: Found template "${templateData.name}" using TemplateService`);
          
          // Ensure template has proper structure
          if (!templateData.structure) {
            templateData.structure = { 
              fields: [{ label: 'Content', type: 'textarea', placeholder: '[CONTENT]' }] 
            };
          } else if (!templateData.structure.fields || !Array.isArray(templateData.structure.fields) || templateData.structure.fields.length === 0) {
            templateData.structure.fields = [{ label: 'Content', type: 'textarea', placeholder: '[CONTENT]' }];
          }
          
          if (!templateLoaded.current) {
            setTemplate(templateData);
            templateLoaded.current = true;
            
            // Initialize form values
            let newFormValues = {};
            
            if (initialValues && initialValues.data) {
              try {
                const parsed = tryParseJSON(initialValues.data);
                if (parsed && typeof parsed === 'object') {
                  newFormValues = parsed;
                } else {
                  newFormValues = { Content: initialValues.data };
                }
              } catch (e) {
                newFormValues = { Content: initialValues.data || '' };
              }
            } else if (initialValues && initialValues.formValues) {
              newFormValues = initialValues.formValues;
            } else if (templateData.format) {
              newFormValues = { Content: templateData.format };
            }
            
            setFormValues(newFormValues);
            setTextareaContent(templateData.format || '');
          }
        } else {
          console.error(`🔍 [StructuredTemplateForm] FAILED: Template not found with ID "${templateId}" or "${actualTemplateId}"`);
          setError("Template not found");
          
          // Emergency - try to create a basic template from initialValues
          if (initialValues && initialValues.data) {
            console.log("🔍 [StructuredTemplateForm] EMERGENCY: Creating fallback template from initialValues.data");
            const emergencyTemplate = {
              id: actualTemplateId,
              name: "Emergency Fallback Template",
              format: initialValues.data,
              created_at: new Date().toISOString(),
              structure: {
                fields: [{ label: 'Content', type: 'textarea', placeholder: '[CONTENT]' }]
              }
            };
            
            setTemplate(emergencyTemplate);
            setFormValues({ Content: initialValues.data });
            setTextareaContent(initialValues.data);
          } else {
            // Create an empty emergency template
            const emptyTemplate = {
              id: 'emergency_template',
              name: 'Session Notes',
              format: '',
              created_at: new Date().toISOString(),
              structure: {
                fields: [{ label: 'Content', type: 'textarea', placeholder: '[CONTENT]' }]
              }
            };
            
            setTemplate(emptyTemplate);
            setFormValues({ Content: '' });
            setTextareaContent('');
            
            // Log all available templates for debugging
            const allTemplates = TemplateService.getTemplates();
            console.log("🔍 [StructuredTemplateForm] Available templates:", 
              allTemplates.map(t => ({ id: t.id, name: t.name })));
          }
        }
      } catch (error) {
        console.error("🔍 [StructuredTemplateForm] Error loading template:", error);
        setError(error.message || "Failed to load template");
        
        // Emergency fallback for error case
        const emergencyTemplate = {
          id: 'emergency_error_template',
          name: 'Session Notes',
          format: initialValues && initialValues.data ? initialValues.data : '',
          created_at: new Date().toISOString(),
          structure: {
            fields: [{ label: 'Content', type: 'textarea', placeholder: '[CONTENT]' }]
          }
        };
        
        setTemplate(emergencyTemplate);
        setFormValues({ Content: initialValues && initialValues.data ? initialValues.data : '' });
        setTextareaContent(initialValues && initialValues.data ? initialValues.data : '');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
    
    return () => {
      templateLoaded.current = false;
    };
  }, [templateId, initialValues]);

  // Function to handle field value changes
  const handleFieldChange = (label, value) => {
    console.log(`🔍 [StructuredTemplateForm] handleFieldChange called for "${label}", value length: ${value.length}`);
    
    // Update local state
    setFormValues(prev => {
      const updated = { ...prev, [label]: value };
      console.log(`🔍 [StructuredTemplateForm] Updated formValues:`, 
        Object.keys(updated).map(k => `${k}: ${updated[k] ? updated[k].substring(0, 20) + '...' : 'empty'}`));
      
      // Also notify parent about the change
      onChange(updated);
      
      return updated;
    });
  };
  
  // Handle textarea content change
  const handleTextareaChange = (e) => {
    const newValue = e.target.value;
    setTextareaContent(newValue);
    
    // VERY IMPORTANT: Mark that user has edited the content
    // This prevents any automatic updates from overwriting user changes
    userHasEdited.current = true;
    didInitialize.current = true;
    
    // Throttle logging to reduce console spam
    if (newValue.length % 20 === 0) {
      console.log(`🔍 [StructuredTemplateForm] User edited content, length: ${newValue.length}`);
    }
    
    // Send updates back to parent
    const updates = { 
      content: newValue,
      data: newValue,
      Content: newValue  // Use both "content" and "Content" fields for compatibility
    };
    
    // Update local form values directly
    const newFormValues = { ...formValues, Content: newValue };
    setFormValues(newFormValues);
    
    // Notify parent of changes
    onChange(updates);
  };

  // Render each field based on its type.
  const renderField = (field) => {
    const { label, type } = field;
    const baseTextareaStyles = "w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm bg-white resize-vertical min-h-[100px] transition-all";
    const baseInputStyles = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm bg-white transition-all";
    
    // Check if this field exists in formValues
    const hasValue = label in formValues;
    console.log(`🔍 [StructuredTemplateForm] Rendering field "${label}" (${type}), has value: ${hasValue}`);
    
    if (type === 'textarea') {
      return (
        <div key={label} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-800">{label}</h3>
          </div>
          <textarea
            rows={5}
            value={formValues[label] || ''}
            onChange={(e) => {
              handleFieldChange(label, e.target.value);
              console.log(`🔍 [StructuredTemplateForm] Textarea changed for field "${label}", new value length: ${e.target.value.length}`);
            }}
            placeholder={`Enter ${label.toLowerCase()}...`}
            className={baseTextareaStyles}
          />
        </div>
      );
    } else {
      return (
        <div key={label} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type="text"
            value={formValues[label] || ''}
            onChange={(e) => {
              handleFieldChange(label, e.target.value);
              console.log(`🔍 [StructuredTemplateForm] Input changed for field "${label}", new value: ${e.target.value}`);
            }}
            placeholder={`Enter ${label.toLowerCase()}...`}
            className={baseInputStyles}
          />
        </div>
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#92C7CF] mb-4"></div>
        <p className="text-sm text-gray-500">Loading template...</p>
      </div>
    );
  }
  
  // Error state
  if (error && !template) {
    return (
      <div className="py-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          <p className="font-medium">Error loading template</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <p className="text-gray-500 mt-4">
          Please try refreshing the page or contact support.
        </p>
      </div>
    );
  }

  // No template state - emergency fallback
  if (!template) {
    return (
      <div className="py-4">
        <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg mb-4 text-sm">
          <p>Template not found. Using basic editor instead.</p>
        </div>
        
        <div className="mb-6">
          <textarea
            rows={15}
            value={textareaContent}
            onChange={handleTextareaChange}
            placeholder="Enter session notes here..."
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm bg-white resize-vertical min-h-[300px]"
          />
        </div>
      </div>
    );
  }
  
  // Check if this is a simple template with only a Content field
  const isSimpleTemplate = template.structure.fields.length === 1 && 
                         template.structure.fields[0].label === 'Content';
  
  // ALWAYS use the simple approach - the structured form is causing issues
  // This ensures we always show SOMETHING to the user
  console.log('🔍 [StructuredTemplateForm] Rendering simple textarea with content length:', textareaContent.length);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-gray-800">
        {template ? (template.name || 'Session Notes') : 'Session Notes'}
      </h2>
      
      <div className="mb-6">
        <textarea
          rows={15}
          value={textareaContent}
          onChange={handleTextareaChange}
          placeholder="Enter session notes here..."
          className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92C7CF] focus:border-[#92C7CF] shadow-sm bg-white resize-vertical min-h-[300px]"
        />
      </div>
    </div>
  );
};

export default StructuredTemplateForm;