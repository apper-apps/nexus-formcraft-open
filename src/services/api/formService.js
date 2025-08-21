import { formsData } from "@/services/mockData/forms.json";
import { responseService } from "./responseService";
// Create a copy to prevent direct mutation of imported data
let forms = [...formsData];

// Function to generate next available ID
const getNextId = () => {
  return forms.length > 0 ? Math.max(...forms.map(f => f.Id)) + 1 : 1;
};

const generatePublishId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const formService = {
  async getAll() {
    await delay();
    return forms.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

async create(formData) {
await delay();
const newForm = {
      Id: getNextId(),
      name: formData.name || "Untitled Form",
      description: formData.description || "",
fields: (formData.fields || []).map(field => ({
        ...field,
        showCondition: field.showCondition || {
          enabled: false,
          fieldId: '',
          operator: 'equals',
          value: ''
        }
      })),
      settings: formData.settings || {
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
        allowMultipleSubmissions: true
      },
      style: formData.style || {
        primaryColor: '#8B7FFF',
        fontFamily: 'Inter',
        formWidth: 'medium'
      },
      notifications: formData.notifications || {
        enabled: false,
        recipients: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: false,
      publishUrl: null,
      submissionCount: 0
    };
    
    forms.push(newForm);
    return { ...newForm };
  },

  async getById(id) {
    await delay();
    const form = forms.find(f => f.Id === id);
    if (!form) {
      throw new Error("Form not found");
    }
    return { ...form };
  },


async update(id, formData) {
    await delay();
    const index = forms.findIndex(f => f.Id === id);
    if (index === -1) {
throw new Error("Form not found");
    }
const updatedForm = {
      ...forms[index],
      ...formData,
      fields: (formData.fields || forms[index].fields || []).map(field => ({
        ...field,
        showCondition: field.showCondition || {
          enabled: false,
          fieldId: '',
          operator: 'equals',
          value: ''
        }
      })),
      notifications: formData.notifications || forms[index].notifications || {
        enabled: false,
        recipients: []
      }
    };
    forms[index] = updatedForm;
    return updatedForm;
  },

  async publish(id) {
    await delay();
    const index = forms.findIndex(f => f.Id === id);
    if (index === -1) {
      throw new Error("Form not found");
    }
    const publishId = generatePublishId();
    const publishUrl = `${window.location.origin}/form/${publishId}`;
    forms[index] = { 
      ...forms[index], 
      isPublished: true, 
      publishUrl,
      publishId 
    };
    return { ...forms[index] };
  },

  async unpublish(id) {
    await delay();
    const index = forms.findIndex(f => f.Id === id);
    if (index === -1) {
      throw new Error("Form not found");
    }
    forms[index] = { 
      ...forms[index], 
      isPublished: false, 
      publishUrl: null,
      publishId: null 
    };
    return { ...forms[index] };
  },

async getByPublishId(publishId) {
    await delay();
    const form = forms.find(f => f.publishId === publishId && f.isPublished);
    if (!form) {
      throw new Error("Published form not found");
    }
    return { ...form };
  },

async incrementSubmissionCount(formId) {
    await delay();
    const formIndex = forms.findIndex(f => f.Id === parseInt(formId));
    if (formIndex === -1) {
      throw new Error("Form not found");
    }
    forms[formIndex].submissionCount = (forms[formIndex].submissionCount || 0) + 1;
    forms[formIndex].updatedAt = new Date().toISOString();
    return { ...forms[formIndex] };
  },

  async getByPublishId(publishId) {
    await delay();
    const form = forms.find(f => f.publishId === publishId && f.isPublished);
    if (!form) {
      throw new Error("Form not found or no longer available");
    }
    return { ...form };
  },

  async getAnalytics(formId) {
    await delay();
    const form = forms.find(f => f.Id === parseInt(formId));
    if (!form) {
      throw new Error("Form not found");
    }

    const responses = await responseService.getByFormId(formId);
    const totalResponses = responses.length;
    
    // Calculate this week's responses
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekResponses = responses.filter(r => 
      new Date(r.submittedAt) >= oneWeekAgo
    ).length;

    // Calculate previous week's responses for trend comparison
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const lastWeekResponses = responses.filter(r => {
      const responseDate = new Date(r.submittedAt);
      return responseDate >= twoWeeksAgo && responseDate < oneWeekAgo;
    }).length;

    // Calculate trend
    let trend = 'stable';
    if (thisWeekResponses > lastWeekResponses) {
      trend = 'up';
    } else if (thisWeekResponses < lastWeekResponses) {
      trend = 'down';
    }

    // Get last submission date
    const lastSubmission = responses.length > 0 
      ? responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0].submittedAt
      : null;

    return {
      totalResponses,
      thisWeekResponses,
      lastWeekResponses,
      trend,
      lastSubmissionDate: lastSubmission,
      responseRate: totalResponses > 0 ? Math.round((thisWeekResponses / 7) * 100) : 0
    };
  },
  async delete(id) {
    await delay();
    const index = forms.findIndex(f => f.Id === id);
    if (index === -1) {
      throw new Error("Form not found");
    }
    forms.splice(index, 1);
    return true;
  }
};