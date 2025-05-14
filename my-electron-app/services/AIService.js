/**
 * AIService - Manages connections to AI services for note generation
 * Supports OpenAI/ChatGPT API for clinical note generation
 */

// Use browser's native fetch API
const fetchAPI = window.fetch;

class AIService {
  constructor() {
    // Default configuration - Using OpenAI API
    this.config = {
      apiKey: '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', // OpenAI API key
      model: 'gpt-3.5-turbo', // OpenAI model
      endpoint: 'https://api.openai.com/v1/chat/completions',
      temperature: 0.7,
      maxTokens: 1000
    };
  }

  /**
   * Configure the AI service
   * @param {Object} options - Configuration options
   */
  configure(options = {}) {
    this.config = {
      ...this.config,
      ...options
    };
    console.log('AIService configured with model:', this.config.model);
    
    // Store API key in localStorage for persistence
    if (options.apiKey) {
      try {
        localStorage.setItem('aiservice_apikey', options.apiKey);
      } catch (error) {
        console.error('Error storing API key:', error);
      }
    }
  }

  /**
   * Load configuration from storage
   */
  loadConfig() {
    try {
      const storedApiKey = localStorage.getItem('aiservice_apikey');
      if (storedApiKey) {
        this.config.apiKey = storedApiKey;
        return true;
      }
    } catch (error) {
      console.error('Error loading API key from storage:', error);
    }
    return false;
  }

  /**
   * Check if the service is configured with an API key
   * @returns {boolean} - Whether the service has an API key
   */
  isConfigured() {
    return !!this.config.apiKey;
  }

  /**
   * Generate a clinical note using the OpenAI/ChatGPT API
   * @param {Object} data - Data needed for note generation
   * @param {string} data.patientInfo - Basic patient information
   * @param {string} data.sessionType - Type of session (SOAP, DAP, etc.)
   * @param {string} data.transcript - Transcript of the session audio
   * @param {Object} data.templateData - Template data for structured notes
   * @param {Function} progressCallback - Callback for progress updates (0-100)
   * @returns {Promise<string>} - Generated note
   */
  async generateNote(data, progressCallback = () => {}) {
    if (!this.isConfigured()) {
      if (!this.loadConfig()) {
        throw new Error('AIService is not configured with an API key');
      }
    }

    // Start progress at 10%
    progressCallback(10);

    // Build the prompt based on session type and data
    const prompt = this.buildPrompt(data);
    
    // Update progress to 20%
    progressCallback(20);

    try {
      // Use OpenAI API format
      const response = await fetchAPI(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a Medical Note Processing Assistant specialized in analyzing and generating medical notes in various formats (SOAP, DAP, or Custom). You create highly professional and clinically accurate documentation following standard medical practices.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      // Update progress to 80%
      progressCallback(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Update progress to 100%
      progressCallback(100);
      
      // Extract the generated text from the response (OpenAI format)
      const generatedText = result.choices[0]?.message?.content || '';
      return generatedText;
    } catch (error) {
      console.error('Error generating note:', error);
      throw error;
    }
  }

  /**
   * Build a prompt for the AI based on session data
   * @param {Object} data - Session data
   * @returns {string} - Prompt for the AI
   */
  buildPrompt(data) {
    const { patientInfo, sessionType, transcript, templateData, customInstructions } = data;
    
    // Start with the standardized prompt
    let prompt = `Generalized Medical Note Processing Prompt:
You are a Medical Note Processing Assistant. Your task is to analyze the provided medical note (SOAP, DAP, or Custom) and perform the requested actions.
Keep in mind that the audio from the conversation should be used.

Instructions:
1️⃣ Identify the note type and extract key information.
2️⃣ Perform tasks as specified:
    • Summarize main details
    • Answer questions
    • Generate follow-up recommendations
    • Clarify treatment plans

Format Adjustment:
    • SOAP Note: Subjective, Objective, Assessment, Plan
    • DAP Note: Data, Assessment, Plan
    • Custom Note: Follow provided structure

PATIENT INFORMATION:
${patientInfo}

`;
    
    // Add transcript if available
    if (transcript && transcript.trim()) {
      prompt += `SESSION TRANSCRIPT/AUDIO:
${transcript}

`;
    }
    
    // Specify the note type and any additional structure
    prompt += `Note Type: ${sessionType.toUpperCase()}\n`;
    
    // Session type specific templates and instructions
    if (sessionType === 'soap') {
      prompt += `Please generate a complete SOAP note with the following sections:
SUBJECTIVE: Include patient's reported symptoms, concerns, medical history, and relevant personal information.
OBJECTIVE: Include observable data, vital signs, examination findings, and test results.
ASSESSMENT: Include diagnosis, evaluation of patient's condition, and clinical reasoning.
PLAN: Include treatment plan, medications, follow-up appointments, and patient education.

`;
    } else if (sessionType === 'dap') {
      prompt += `Please generate a complete DAP note with the following sections:
DATA: Include both subjective (what the patient reports) and objective (examination findings) information.
ASSESSMENT: Include clinical impressions, diagnosis considerations, and evaluation of patient's status.
PLAN: Include treatment recommendations, medications, referrals, and follow-up care.

`;
    } else if (templateData) {
      // For custom templates, provide the structure
      prompt += `Custom Template Structure:
${templateData.structure || 'Custom format'}

Please follow this exact template structure while filling in appropriate clinical content based on the patient information and session transcript.
`;
      if (templateData.fields) {
        prompt += `The note must include these specific fields: ${templateData.fields.join(', ')}\n\n`;
      }
    } else {
      // Generic format
      prompt += `Please structure the note in a clear, professional format appropriate for a clinical record.\n\n`;
    }
    
    // Add any custom instructions if provided
    if (customInstructions) {
      prompt += `CUSTOM INSTRUCTIONS:
${customInstructions}

`;
    }
    
    // Additional instructions for clinical quality and formatting
    prompt += `IMPORTANT GUIDELINES:
- Use professional clinical language and terminology
- Be concise but thorough, focusing on clinically relevant information
- Include objective observations separate from subjective reports
- When documenting assessment, reference specific symptoms that support diagnostic conclusions
- For the treatment plan, provide specific, actionable steps
- Format the note according to the specified structure (SOAP, DAP, or custom)
- Maintain proper medical documentation standards
- Include appropriate details from the provided patient information and transcript
`;
    
    return prompt;
  }

  /**
   * Fallback method that returns a simulated note
   * Used when API is not configured or for testing
   * @param {Object} data - Session data (same as generateNote)
   * @param {Function} progressCallback - Callback for progress updates
   * @returns {Promise<string>} - Simulated note
   */
  async generateSimulatedNote(data, progressCallback = () => {}) {
    // Simulate API delay and progress
    const simulateProgress = () => {
      return new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          progressCallback(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 300);
      });
    };

    await simulateProgress();

    // Return a predefined note based on session type
    if (data.sessionType === 'soap') {
      return this.getSimulatedSOAPNote(data.patientInfo);
    } else if (data.sessionType === 'dap') {
      return this.getSimulatedDAPNote(data.patientInfo);
    } else {
      return this.getSimulatedGenericNote(data.patientInfo);
    }
  }

  /**
   * Get a simulated SOAP note
   * @param {string} patientInfo - Patient information
   * @returns {string} - Simulated SOAP note
   */
  getSimulatedSOAPNote(patientInfo) {
    const patientName = this.extractPatientName(patientInfo);
    
    return `🧠 Therapy Note (SOAP Format)

Client: ${patientName}
Date: ${new Date().toLocaleDateString()}
Session Type: Individual Therapy

SUBJECTIVE:
Client reports experiencing increased anxiety symptoms over the past two weeks, particularly in social situations. States, "I feel like everyone is watching me and judging me." Describes physical symptoms including racing heart, shortness of breath, and excessive sweating when in groups. Reports disrupted sleep averaging 5-6 hours per night. Mentions using deep breathing techniques previously taught but with limited success. Denies suicidal or homicidal ideation.

OBJECTIVE:
Client arrived on time and was appropriately dressed. Appeared anxious as evidenced by restlessness, fidgeting, and minimal eye contact during initial portion of session. Speech was rapid at times. Affect was congruent with reported mood. No evidence of psychosis or thought disorder. Engaged appropriately in session and demonstrated insight into anxiety triggers. Successfully practiced progressive muscle relaxation during session with notable decrease in physical tension.

ASSESSMENT:
Client continues to meet criteria for Generalized Anxiety Disorder with increasing social anxiety symptoms. Recent stressors include upcoming work presentation and anniversary of family conflict. Demonstrates good insight and motivation for treatment. Cognitive distortions primarily center around catastrophizing and mind-reading. Has shown capacity to implement coping strategies when prompted but struggles with consistent independent application.

PLAN:
1. Continue weekly CBT sessions focusing on challenging cognitive distortions
2. Introduce exposure hierarchy for social anxiety symptoms
3. Assign daily practice of progressive muscle relaxation with tracking log
4. Review and refine relapse prevention strategies
5. Explore potential benefits of adjunctive medication management with psychiatrist`;
  }

  /**
   * Get a simulated DAP note
   * @param {string} patientInfo - Patient information
   * @returns {string} - Simulated DAP note
   */
  getSimulatedDAPNote(patientInfo) {
    const patientName = this.extractPatientName(patientInfo);
    
    return `🧠 Therapy Note (DAP Format)

Client: ${patientName}
Date: ${new Date().toLocaleDateString()}
Session Type: Individual Therapy

DATA:
Client reported experiencing recurring nightmares and flashbacks related to past trauma. Described triggered response when hearing loud noises, stating "I immediately go back to that moment." Reports avoiding crowded places and experiencing hypervigilance in public settings. Sleep has decreased to 4-5 hours per night with multiple awakenings. Has been using grounding techniques inconsistently. Mood described as "on edge" with 7/10 anxiety levels. Denied current suicidal ideation, plan, or intent.

ASSESSMENT:
Client demonstrates symptoms consistent with PTSD diagnosis, with heightened reactivity to environmental triggers. Recent increase in symptoms appears related to anniversary of traumatic event. Client shows good insight into trauma responses and connection between thoughts and behaviors. Avoidance behaviors are limiting daily functioning, particularly in social and professional contexts. Despite symptom increase, client demonstrates resilience and commitment to recovery process.

PLAN:
1. Continue weekly trauma-focused CBT sessions
2. Introduce additional grounding techniques with practice during session
3. Develop written safety plan for managing heightened symptom periods
4. Assign daily mindfulness practice with emphasis on body scan meditation
5. Coordinate with psychiatrist regarding medication effectiveness
6. Review sleep hygiene practices and implement structured sleep log`;
  }

  /**
   * Get a simulated generic note
   * @param {string} patientInfo - Patient information
   * @returns {string} - Simulated generic note
   */
  getSimulatedGenericNote(patientInfo) {
    const patientName = this.extractPatientName(patientInfo);
    
    return `🧠 Therapy Session Notes

Client: ${patientName}
Date: ${new Date().toLocaleDateString()}
Session Type: Individual Therapy
Duration: 50 minutes

SESSION CONTENT:
Client presented with ongoing concerns related to depressive symptoms, reporting moderate improvement since our previous session. Mood was described as "less heavy" with increased engagement in previously enjoyable activities. Sleep remains disrupted with early morning awakening. Client shared progress in implementing cognitive restructuring techniques, noting "I've been catching myself when I start spiraling in negative thoughts."

We reviewed homework assignments including daily mood tracking and behavioral activation exercises. Client successfully completed 4/7 planned activities, representing improvement from previous weeks. Barriers to completion were discussed, with emphasis on practical strategies for overcoming anticipatory anxiety.

Session focused on developing more effective communication strategies for workplace interactions. Role-played assertive responses to challenging scenarios. Client demonstrated good insight and receptiveness to feedback.

Continued exploration of family-of-origin issues, particularly patterns of emotional avoidance. Client made connection between current relationship difficulties and observed parental interactions during childhood.

INTERVENTIONS:
- Cognitive restructuring of negative core beliefs
- Behavioral activation planning and review
- Communication skills training with role play
- Psychoeducation regarding depression maintenance factors

PLAN:
1. Continue weekly individual therapy sessions
2. Maintain mood tracking with expanded focus on identifying triggering contexts
3. Practice assertive communication skills in at least two workplace interactions
4. Begin journaling about family patterns and their impact on current relationships
5. Schedule psychiatric consultation to evaluate medication effectiveness`;
  }

  /**
   * Extract patient name from patient info string
   * @param {string} patientInfo - Patient information string
   * @returns {string} - Patient name or default
   */
  extractPatientName(patientInfo) {
    try {
      // Try to extract name from the patientInfo string
      const nameMatch = patientInfo.match(/Name:\s*([^\n]+)/i) || 
                        patientInfo.match(/Patient:\s*([^\n]+)/i) ||
                        patientInfo.match(/Client:\s*([^\n]+)/i);
      
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }
      
      // If patient name is just the first part of the info
      const firstLine = patientInfo.split('\n')[0].trim();
      if (firstLine && !firstLine.includes(':')) {
        return firstLine;
      }
    } catch (e) {
      console.error('Error extracting patient name:', e);
    }
    
    return 'Patient';
  }
}

// Create a singleton instance
const aiServiceInstance = new AIService();

export default aiServiceInstance;