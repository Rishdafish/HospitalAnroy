/**
 * Validation service for verifying template data integrity
 * Acts as a diagnostic tool for the template system
 */

import TemplateService from './TemplateService';
import Database from './database';

// Validate that the template is properly structured
const validateTemplate = async (templateId) => {
  try {
    console.log(`Validating template with ID: ${templateId}`);
    
    // Get template from service
    const template = await TemplateService.getTemplate(templateId);
    
    if (!template) {
      console.error(`Template with ID ${templateId} not found`);
      return {
        valid: false,
        errors: [`Template with ID ${templateId} not found`]
      };
    }
    
    // Check required fields
    const errors = [];
    if (!template.name) errors.push('Template name is missing');
    if (!template.format) errors.push('Template format is missing');
    
    // Check structure
    if (!template.structure) {
      errors.push('Template structure is missing');
    } else if (!template.structure.fields || !Array.isArray(template.structure.fields)) {
      errors.push('Template fields are missing or not an array');
    } else if (template.structure.fields.length === 0) {
      errors.push('Template has no fields defined');
    } else {
      // Verify fields are properly structured
      for (let i = 0; i < template.structure.fields.length; i++) {
        const field = template.structure.fields[i];
        if (!field.label) errors.push(`Field ${i} is missing label`);
        if (!field.placeholder) errors.push(`Field ${i} is missing placeholder`);
        if (!field.type) errors.push(`Field ${i} is missing type`);
      }
    }
    
    // Get raw template from database
    const dbTemplates = await Database.getTemplates();
    const dbTemplate = dbTemplates.find(t => t.id === templateId);
    
    // Compare template vs database record
    if (!dbTemplate) {
      errors.push('Template exists in service but not in database');
    } else {
      // Check structure integrity between service and database
      const serviceJSON = JSON.stringify(template);
      const dbJSON = JSON.stringify(dbTemplate);
      
      if (serviceJSON !== dbJSON) {
        errors.push('Template in service does not match database record');
        console.log('Service template:', template);
        console.log('Database template:', dbTemplate);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      template
    };
  } catch (error) {
    console.error('Error validating template:', error);
    return {
      valid: false,
      errors: [`Error validating template: ${error.message}`]
    };
  }
};

// Check if templates are being properly saved to database.db
const checkDatabasePersistence = async () => {
  try {
    // Check if database contains templates
    const dbData = localStorage.getItem('database.db');
    
    if (!dbData) {
      return {
        valid: false,
        errors: ['database.db not found in localStorage']
      };
    }
    
    const parsedData = JSON.parse(dbData);
    
    if (!parsedData.templates || !Array.isArray(parsedData.templates)) {
      return {
        valid: false,
        errors: ['templates not found in database.db or not an array']
      };
    }
    
    // Get templates from service
    const templates = await TemplateService.getTemplates();
    
    // Compare count
    if (templates.length !== parsedData.templates.length) {
      return {
        valid: false,
        errors: [`Template count mismatch: ${templates.length} in service vs ${parsedData.templates.length} in database`],
        serviceTemplates: templates,
        dbTemplates: parsedData.templates
      };
    }
    
    return {
      valid: true,
      dbTemplates: parsedData.templates,
      serviceTemplates: templates
    };
  } catch (error) {
    console.error('Error checking database persistence:', error);
    return {
      valid: false,
      errors: [`Error checking database persistence: ${error.message}`]
    };
  }
};

export { validateTemplate, checkDatabasePersistence };