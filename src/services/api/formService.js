import { formsData } from "@/services/mockData/forms.json";

// Create a copy to prevent direct mutation of imported data
let forms = [...formsData];

// Function to generate next available ID
const getNextId = () => {
  return forms.length > 0 ? Math.max(...forms.map(f => f.Id)) + 1 : 1;
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
      fields: formData.fields || [],
      settings: formData.settings || {
        submitButtonText: "Submit",
        successMessage: "Thank you for your submission!",
        allowMultipleSubmissions: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: false,
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

  async create(formData) {
    await delay();
    const newForm = {
      Id: Math.max(...forms.map(f => f.Id), 0) + 1,
      ...formData,
      createdAt: formData.createdAt || new Date().toISOString()
    };
    forms.unshift(newForm);
    return { ...newForm };
  },

  async update(id, formData) {
    await delay();
    const index = forms.findIndex(f => f.Id === id);
    if (index === -1) {
      throw new Error("Form not found");
    }
    forms[index] = { ...forms[index], ...formData };
    return { ...forms[index] };
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