/**
 * TemplateService - Manages note templates across the application
 * Acts as a central store for templates and provides methods to manipulate the data
 * Uses database.js for persistent storage in database.db
 */

import Database from './database';
import initialTemplates from '../initialTemplates';

class TemplateService {
  constructor() {
    // Initialize with local cache
    this.templates = [...initialTemplates]; // Start with initial templates to prevent empty arrays
    this.subscribers = [];
    this.initialized = false;
    this.initializationPromise = null;
    
    // Initialize the database
    this.initializeDatabase();
  }

  // Initialize database with sample templates if empty
  async initializeDatabase() {
    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = new Promise(async (resolve) => {
      try {
        // Get templates from database
        const dbTemplates = await Database.getTemplates();
        
        // If no templates exist, add the initial ones
        if (dbTemplates.length === 0) {
          console.log('Initializing database with sample templates');
          for (const template of initialTemplates) {
            await Database.addTemplate(template);
          }
          this.templates = await Database.getTemplates();
        } else {
          this.templates = dbTemplates;
        }
        
        this.initialized = true;
        this.notifySubscribers();
        resolve(this.templates);
      } catch (error) {
        console.error('Error initializing database:', error);
        // Fallback to sample templates if database init fails
        this.templates = [...initialTemplates];
        this.initialized = true;
        this.notifySubscribers();
        resolve(this.templates);
      }
    });
    
    return this.initializationPromise;
  }

  // Get all templates - IMPORTANT: This is now synchronous to fix compatibility issues
  getTemplates() {
    // If not initialized yet, return initial templates
    if (!this.initialized) {
      return [...initialTemplates];
    }
    
    // Return cached templates
    return [...this.templates];
  }

  // More explicit name for async version
  async getTemplatesAsync() {
    // Ensure database is initialized
    if (!this.initialized) {
      await this.initializeDatabase();
    }
    
    try {
      // Get latest templates from database
      this.templates = await Database.getTemplates();
      return [...this.templates];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [...this.templates]; // Return cached templates on error
    }
  }

  // Get a single template by ID
  async getTemplate(id) {
    // Ensure database is initialized
    if (!this.initialized) {
      await this.initializeDatabase();
    }
    
    try {
      // For prefixed IDs, try to get the actual ID
      const actualId = id.startsWith('template_') ? id.replace('template_', '') : id;
      
      // First check memory cache for faster response
      const cachedTemplate = this.templates.find(t => t.id === id || t.id === actualId);
      if (cachedTemplate) {
        return cachedTemplate;
      }
      
      // If not found in cache, try the database
      let template = await Database.getTemplate(id);
      
      // If not found and we have a transformed ID, try with that
      if (!template && id !== actualId) {
        template = await Database.getTemplate(actualId);
      }
      
      // Update cache if found in database
      if (template && !this.templates.some(t => t.id === template.id)) {
        this.templates.push(template);
      }
      
      return template || null;
    } catch (error) {
      console.error(`Error getting template ${id}:`, error);
      // Search memory cache as a fallback
      const actualId = id.startsWith('template_') ? id.replace('template_', '') : id;
      return this.templates.find(t => t.id === id || t.id === actualId) || null;
    }
  }

  // Synchronous version for components that can't use async
  getTemplateSync(id) {
    // Handle both prefixed and non-prefixed IDs
    const actualId = id.startsWith('template_') ? id.replace('template_', '') : id;
    
    // Try to find the template with either ID
    const template = this.templates.find(template => 
      template.id === id || template.id === actualId
    );
    
    return template || null;
  }

  // Add a new template
  async addTemplate(template) {
    try {
      // Add structure object if not provided
      if (!template.structure && template.format) {
        // Generate a basic structure from the format
        const lines = template.format.split('\n');
        const fields = [];
        
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
                      placeholderText.includes('STATUS') ||
                      placeholderText.includes('COMPLAINT') ||
                      placeholderText.includes('HISTORY') ? 'textarea' : 'text'
              });
            }
          }
        }
        
        template.isStructured = true;
        template.structure = { fields };
      }
      
      const newTemplate = await Database.addTemplate(template);
      
      // Update local cache
      this.templates = await Database.getTemplates();
      this.notifySubscribers();
      
      return newTemplate;
    } catch (error) {
      console.error('Error adding template:', error);
      return null;
    }
  }

  // Update an existing template
  async updateTemplate(id, updatedData) {
    try {
      const updated = await Database.updateTemplate(id, updatedData);
      
      // Update local cache
      this.templates = await Database.getTemplates();
      this.notifySubscribers();
      
      return updated;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      return null;
    }
  }

  // Delete a template
  async deleteTemplate(id) {
    try {
      const result = await Database.deleteTemplate(id);
      
      // Update local cache if successful
      if (result) {
        this.templates = await Database.getTemplates();
        this.notifySubscribers();
      }
      
      return result;
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      return false;
    }
  }

  // Subscribe to changes
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Immediately call the callback with current data
    try {
      callback();
    } catch (error) {
      console.error('Error in template subscriber callback:', error);
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers of changes
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in template subscriber callback:', error);
      }
    });
  }
}

// Create a singleton instance
const templateServiceInstance = new TemplateService();

export default templateServiceInstance;