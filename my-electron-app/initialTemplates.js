/**
 * Initial templates for the application
 * Provides default templates for users to get started with
 */

// Define initial templates with unique IDs
const initialTemplates = [
  {
    id: 'template_default_1',
    name: 'Psychotherapy Note',
    format: 'DATE: [DATE]\nSTART TIME: [START TIME]\nEND TIME: [END TIME]\nSESSION LENGTH: [LENGTH] minutes\n\nPRESENTING ISSUES:\n[PRESENTING ISSUES]\n\nMENTAL STATUS:\n[MENTAL STATUS]\n\nINTERVENTIONS:\n[INTERVENTIONS]\n\nPLAN & RECOMMENDATIONS:\n[PLAN]',
    includeCptCodes: true,
    includeAddOnCodes: false,
    isStructured: true,
    structure: {
      fields: [
        { label: 'DATE', placeholder: '[DATE]', type: 'date' },
        { label: 'START TIME', placeholder: '[START TIME]', type: 'text' },
        { label: 'END TIME', placeholder: '[END TIME]', type: 'text' },
        { label: 'SESSION LENGTH', placeholder: '[LENGTH]', type: 'text', suffix: 'minutes' },
        { label: 'PRESENTING ISSUES', placeholder: '[PRESENTING ISSUES]', type: 'textarea' },
        { label: 'MENTAL STATUS', placeholder: '[MENTAL STATUS]', type: 'textarea' },
        { label: 'INTERVENTIONS', placeholder: '[INTERVENTIONS]', type: 'textarea' },
        { label: 'PLAN & RECOMMENDATIONS', placeholder: '[PLAN]', type: 'textarea' },
      ]
    }
  },
  {
    id: 'template_default_2',
    name: 'Intake Assessment',
    format: 'DATE: [DATE]\nCLIENT NAME: [NAME]\nDOB: [DOB]\n\nCHIEF COMPLAINT:\n[COMPLAINT]\n\nHISTORY OF PRESENT ILLNESS:\n[HISTORY]\n\nPAST PSYCHIATRIC HISTORY:\n[PAST HISTORY]\n\nMEDICAL HISTORY:\n[MEDICAL HISTORY]\n\nFAMILY HISTORY:\n[FAMILY HISTORY]\n\nMENTAL STATUS EXAMINATION:\n[MSE]\n\nDIAGNOSIS:\n[DIAGNOSIS]\n\nTREATMENT PLAN:\n[PLAN]',
    includeCptCodes: true,
    includeAddOnCodes: true,
    isStructured: true,
    structure: {
      fields: [
        { label: 'DATE', placeholder: '[DATE]', type: 'date' },
        { label: 'CLIENT NAME', placeholder: '[NAME]', type: 'text' },
        { label: 'DOB', placeholder: '[DOB]', type: 'text' },
        { label: 'CHIEF COMPLAINT', placeholder: '[COMPLAINT]', type: 'textarea' },
        { label: 'HISTORY OF PRESENT ILLNESS', placeholder: '[HISTORY]', type: 'textarea' },
        { label: 'PAST PSYCHIATRIC HISTORY', placeholder: '[PAST HISTORY]', type: 'textarea' },
        { label: 'MEDICAL HISTORY', placeholder: '[MEDICAL HISTORY]', type: 'textarea' },
        { label: 'FAMILY HISTORY', placeholder: '[FAMILY HISTORY]', type: 'textarea' },
        { label: 'MENTAL STATUS EXAMINATION', placeholder: '[MSE]', type: 'textarea' },
        { label: 'DIAGNOSIS', placeholder: '[DIAGNOSIS]', type: 'textarea' },
        { label: 'TREATMENT PLAN', placeholder: '[PLAN]', type: 'textarea' },
      ]
    }
  },
  {
    id: 'template_default_3',
    name: 'SOAP Note',
    format: 'DATE: [DATE]\nCLIENT: [CLIENT NAME]\n\nSUBJECTIVE:\n[SUBJECTIVE]\n\nOBJECTIVE:\n[OBJECTIVE]\n\nASSESSMENT:\n[ASSESSMENT]\n\nPLAN:\n[PLAN]',
    includeCptCodes: false,
    includeAddOnCodes: false,
    isStructured: true,
    structure: {
      fields: [
        { label: 'DATE', placeholder: '[DATE]', type: 'date' },
        { label: 'CLIENT', placeholder: '[CLIENT NAME]', type: 'text' },
        { label: 'SUBJECTIVE', placeholder: '[SUBJECTIVE]', type: 'textarea' },
        { label: 'OBJECTIVE', placeholder: '[OBJECTIVE]', type: 'textarea' },
        { label: 'ASSESSMENT', placeholder: '[ASSESSMENT]', type: 'textarea' },
        { label: 'PLAN', placeholder: '[PLAN]', type: 'textarea' },
      ]
    }
  }
];

export default initialTemplates;