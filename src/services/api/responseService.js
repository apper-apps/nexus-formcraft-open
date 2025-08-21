import { emailService } from "./emailService";
import { toast } from "react-toastify";

// Mock responses storage
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
    
    // Send email notifications if enabled
    try {
      // Find the form to get notification settings
      const { formService } = await import('./formService');
      const form = await formService.getById(formId);
      
      if (form.notifications?.enabled && form.notifications?.recipients?.length > 0) {
        // Prepare email data
        const formDataForEmail = {};
        Object.entries(responseData).forEach(([fieldId, value]) => {
          const field = form.fields.find(f => f.Id === parseInt(fieldId));
          const fieldLabel = field ? field.label : `Field ${fieldId}`;
          formDataForEmail[fieldLabel] = value;
        });
        
        // Send notification email
        await emailService.sendNotification(
          form.notifications.recipients,
          `New form submission: ${form.name}`,
          form.name,
          formDataForEmail
        );
        
        toast.success(`Notification emails sent to ${form.notifications.recipients.length} recipient(s)`);
      }
    } catch (emailError) {
      console.error('Failed to send notification emails:', emailError);
      toast.warning('Form submitted successfully, but notification emails could not be sent');
    }
    
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
        const fieldValue = response.data[field.Id] || '';
        const formattedValue = formatFieldValue(field, fieldValue);
        row.push(formattedValue);
      });

      csvContent += row.map(escapeCSV).join(',') + '\n';
    });

    return csvContent;
  },

  filterResponses(responses, filters) {
    const { searchTerm, startDate, endDate, fieldFilters, form } = filters;
    
    if (!responses || !responses.length) return [];
    
    return responses.filter(response => {
      // Search term filter - search across all field values
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        let matchesSearch = false;
        
        // Search in response ID
        if (response.Id.toString().includes(searchLower)) {
          matchesSearch = true;
        }
        
        // Search in all field values
        if (!matchesSearch && form && form.fields) {
          for (const field of form.fields) {
            const value = response.data[field.Id];
            if (value !== null && value !== undefined) {
              const stringValue = Array.isArray(value) 
                ? value.join(' ') 
                : String(value);
              
              if (stringValue.toLowerCase().includes(searchLower)) {
                matchesSearch = true;
                break;
              }
            }
          }
        }
        
        if (!matchesSearch) return false;
      }
      
      // Date range filters
      if (startDate || endDate) {
        const responseDate = new Date(response.submittedAt);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (responseDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (responseDate > end) return false;
        }
      }
      
      // Field value filters
      if (fieldFilters && Object.keys(fieldFilters).length > 0) {
        for (const [fieldId, filterValue] of Object.entries(fieldFilters)) {
          if (filterValue && filterValue.trim()) {
            const responseValue = response.data[parseInt(fieldId)];
            
            if (responseValue === null || responseValue === undefined) {
              return false;
            }
            
            // Handle array values (checkboxes)
            if (Array.isArray(responseValue)) {
              if (!responseValue.includes(filterValue)) {
                return false;
              }
            } else {
              // Handle single values
              if (String(responseValue) !== String(filterValue)) {
                return false;
              }
            }
          }
        }
      }
      
      return true;
    });
  }
};