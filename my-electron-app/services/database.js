/**
 * Database service for persistent storage
 * Uses SQLite-like interface for storing application data
 */

// Simulated database with file-based persistence
class Database {
  constructor() {
    this.dbData = {
      templates: [],
      patients: [],
      sessions: []
    };
    
    // Load data from localStorage on startup
    this.loadDatabase();
  }
  
  // Create the database file if it doesn't exist
  async loadDatabase() {
    try {
      // Load from localStorage as a temporary solution
      // In a real implementation, this would use SQLite or another database
      const dbStr = localStorage.getItem('database.db');
      if (dbStr) {
        this.dbData = JSON.parse(dbStr);
        console.log('Database loaded successfully');
      } else {
        console.log('No existing database found, creating new database');
        this.saveDatabase();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      // Initialize with empty data if there's an error
      this.saveDatabase();
    }
  }
  
  // Save the current database to storage with a promise so we can track completion
  async saveDatabase() {
    return new Promise((resolve, reject) => {
      try {
        // Make a deep copy to ensure all nested objects are properly serialized
        const dataToSave = JSON.parse(JSON.stringify(this.dbData));
        localStorage.setItem('database.db', JSON.stringify(dataToSave));
        console.log('Database saved successfully');
        
        // Verify the data was saved correctly
        const savedData = localStorage.getItem('database.db');
        if (!savedData) {
          console.error('Failed to save data: localStorage returned null after save');
          reject(new Error('Failed to save data: localStorage returned null after save'));
          return;
        } 
        
        try {
          // Parse the saved data to verify it's valid JSON
          const parsedData = JSON.parse(savedData);
          console.log('Data verification successful:', 
            `${parsedData.templates.length} templates, ` +
            `${parsedData.patients.length} patients, ` + 
            `${parsedData.sessions.length} sessions`);
          resolve(true);
        } catch (parseError) {
          console.error('Data verification failed: saved data is not valid JSON', parseError);
          reject(parseError);
        }
      } catch (error) {
        console.error('Error saving database:', error);
        reject(error);
      }
    });
  }
  
  // Template operations
  
  // Get all templates
  async getTemplates() {
    return [...this.dbData.templates];
  }
  
  // Get a single template by ID, with improved ID handling
  async getTemplate(id) {
    console.log(`[Database] getTemplate called with ID: "${id}"`);
    
    if (!id) {
      console.error('[Database] getTemplate called with empty ID');
      return null;
    }
    
    // First try exact ID match
    let template = this.dbData.templates.find(template => template.id === id);
    
    // If not found and ID starts with 'template_', try without prefix
    if (!template && id.startsWith('template_')) {
      const rawId = id.replace('template_', '');
      console.log(`[Database] Template not found with ID "${id}", trying raw ID: "${rawId}"`);
      template = this.dbData.templates.find(template => template.id === rawId);
    }
    
    // If not found and ID doesn't have prefix, try with prefix
    if (!template && !id.startsWith('template_')) {
      const prefixedId = 'template_' + id;
      console.log(`[Database] Template not found with ID "${id}", trying prefixed ID: "${prefixedId}"`);
      template = this.dbData.templates.find(template => template.id === prefixedId);
    }
    
    // Last resort - try substring match
    if (!template) {
      console.log(`[Database] Template not found with exact ID matches, trying substring match`);
      template = this.dbData.templates.find(template => 
        template.id.includes(id) || 
        (id.startsWith('template_') && template.id.includes(id.replace('template_', '')))
      );
    }
    
    if (template) {
      console.log(`[Database] Template found: "${template.name}" (ID: ${template.id})`);
    } else {
      console.log(`[Database] Template not found after all matching attempts`);
    }
    
    return template || null;
  }
  
  // Add a new template
  async addTemplate(template) {
    const newTemplate = {
      ...template,
      // Add random component to ensure uniqueness
      id: `${Date.now()}_${Math.floor(Math.random() * 10000)}`, 
      created_at: new Date().toISOString()
    };
    
    this.dbData.templates.push(newTemplate);
    await this.saveDatabase();
    return newTemplate;
  }
  
  // Update an existing template
  async updateTemplate(id, updatedData) {
    const index = this.dbData.templates.findIndex(template => template.id === id);
    if (index !== -1) {
      this.dbData.templates[index] = { 
        ...this.dbData.templates[index], 
        ...updatedData,
        updated_at: new Date().toISOString()
      };
      await this.saveDatabase();
      return this.dbData.templates[index];
    }
    return null;
  }
  
  // Delete a template
  async deleteTemplate(id) {
    const index = this.dbData.templates.findIndex(template => template.id === id);
    if (index !== -1) {
      this.dbData.templates.splice(index, 1);
      await this.saveDatabase();
      return true;
    }
    return false;
  }
}

// Create a singleton instance
const databaseInstance = new Database();

export default databaseInstance;