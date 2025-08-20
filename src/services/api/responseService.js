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
  }
};