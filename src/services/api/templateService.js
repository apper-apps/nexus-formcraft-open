import templatesData from "@/services/mockData/templates.json";
import React from "react";
import Error from "@/components/ui/Error";

// Create a copy to prevent direct mutation of imported data
let templates = [...templatesData];

// Simulate API delay
const delay = () => new Promise(resolve => setTimeout(resolve, 300));

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
    // Return deep copy to prevent mutations
    return JSON.parse(JSON.stringify(template));
  },

  async getByCategory(category) {
    await delay();
    return templates.filter(t => t.category === category).map(t => JSON.parse(JSON.stringify(t)));
  },

  async getFeatured() {
    await delay();
    // Return the most commonly used templates
    const featuredIds = [1, 2, 3];
    return templates.filter(t => featuredIds.includes(t.Id)).map(t => JSON.parse(JSON.stringify(t)));
  },

  async search(query) {
    await delay();
    if (!query) return templates.slice();
    
    const lowerQuery = query.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
).map(t => JSON.parse(JSON.stringify(t)));
  }
};