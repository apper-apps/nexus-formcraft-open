import { formsData } from "@/services/mockData/forms.json";

// Create a copy to prevent direct mutation of imported data
let responses = [];
let nextResponseId = 1;

// Utility function to simulate API delay
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getNextResponseId() {
  return nextResponseId++;
}

export const responseService = {
  async create(formId, responseData) {
    await delay();
    const newResponse = {
      Id: getNextResponseId(),
      formId: parseInt(formId),
      data: responseData,
      submittedAt: new Date().toISOString(),
      ipAddress: '127.0.0.1', // Mock IP
      userAgent: navigator.userAgent || 'Unknown'
    };
    
    responses.push(newResponse);
    return { ...newResponse };
  },

  async getByFormId(formId) {
    await delay();
    const formResponses = responses.filter(r => r.formId === parseInt(formId));
    return formResponses.map(response => ({ ...response }));
  },

  async getAll() {
    await delay();
    return responses.map(response => ({ ...response }));
  },

  async getById(id) {
    await delay();
    const response = responses.find(r => r.Id === parseInt(id));
    if (!response) {
      throw new Error("Response not found");
    }
    return { ...response };
  },

  async delete(id) {
    await delay();
    const index = responses.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Response not found");
    }
    responses.splice(index, 1);
    return true;
  },

  async getResponseCount(formId) {
    await delay();
return responses.filter(r => r.formId === parseInt(formId)).length;
  },

  exportToCSV(form, responses) {
    if (!form || !responses || responses.length === 0) {
      return '';
    }

    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Helper function to format field values based on type
    const formatFieldValue = (field, value) => {
      if (value === null || value === undefined || value === '') return '';
      
      switch (field.type) {
        case 'date':
          try {
            return new Date(value).toLocaleDateString();
          } catch {
            return value;
          }
        
        case 'radio':
        case 'select':
          return String(value);
        
        case 'checkbox':
          if (Array.isArray(value)) {
            return value.join('; ');
          }
          return String(value);
        
        case 'number':
          return String(value);
        
        default:
          return String(value);
      }
    };

    // Create headers
    const headers = ['Response ID', 'Submitted At'];
    form.fields.forEach(field => {
      headers.push(field.label || field.name || 'Untitled Field');
    });

    // Create CSV content
    let csvContent = headers.map(escapeCSV).join(',') + '\n';

    // Add response data
    responses.forEach(response => {
      const row = [
        response.Id,
        response.submittedAt ? new Date(response.submittedAt).toLocaleString() : ''
      ];

      form.fields.forEach(field => {
        const fieldValue = response.data[field.name] || response.data[field.id] || '';
        const formattedValue = formatFieldValue(field, fieldValue);
        row.push(formattedValue);
      });

      csvContent += row.map(escapeCSV).join(',') + '\n';
    });

    return csvContent;
  }
};