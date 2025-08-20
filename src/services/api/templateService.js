import { templatesData } from "@/services/mockData/templates.json";

// Create a copy to prevent direct mutation of imported data
let templates = [...templatesData];

// Simulate API delay
const delay = () => new Promise(resolve => setTimeout(resolve, 500));

export const templateService = {
  async getAll() {
    await delay();
    return templates.slice();
  },

  async getById(id) {
    await delay();
    if (typeof id !== 'number') {
      throw new Error('Template ID must be a number');
    }
    const template = templates.find(t => t.Id === id);
    if (!template) {
      throw new Error('Template not found');
    }
    return { ...template };
  },

  async getByCategory(category) {
    await delay();
    return templates.filter(t => t.category === category).slice();
  }
};