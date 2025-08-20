import { formsData } from "@/services/mockData/forms.json";

// Create a copy to prevent direct mutation of imported data
let forms = [...formsData];

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const formService = {
  async getAll() {
    await delay();
    return forms.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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