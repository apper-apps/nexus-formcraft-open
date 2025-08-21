// Mock template data - inline to avoid missing file issues
const mockTemplates = [
  {
    id: 1,
    name: "Contact Form",
    description: "A simple contact form with name, email, and message fields",
    category: "Contact",
    thumbnail: "/templates/contact-form.jpg",
    fields: [
      { type: "text", label: "Full Name", required: true, placeholder: "Enter your full name" },
      { type: "email", label: "Email Address", required: true, placeholder: "Enter your email" },
      { type: "text", label: "Subject", required: true, placeholder: "Enter subject" },
      { type: "textarea", label: "Message", required: true, placeholder: "Enter your message", rows: 4 }
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Event Registration",
    description: "Registration form for events with participant details",
    category: "Registration",
    thumbnail: "/templates/event-registration.jpg",
    fields: [
      { type: "text", label: "First Name", required: true, placeholder: "Enter first name" },
      { type: "text", label: "Last Name", required: true, placeholder: "Enter last name" },
      { type: "email", label: "Email", required: true, placeholder: "Enter email address" },
      { type: "tel", label: "Phone Number", required: true, placeholder: "Enter phone number" },
      { type: "select", label: "Event Session", required: true, options: ["Morning Session", "Afternoon Session", "Full Day"] },
      { type: "checkbox", label: "Dietary Restrictions", options: ["Vegetarian", "Vegan", "Gluten-free", "No restrictions"] },
      { type: "textarea", label: "Additional Notes", placeholder: "Any special requirements", rows: 3 }
    ],
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z"
  },
  {
    id: 3,
    name: "Job Application",
    description: "Comprehensive job application form with resume upload",
    category: "HR",
    thumbnail: "/templates/job-application.jpg",
    fields: [
      { type: "text", label: "Full Name", required: true, placeholder: "Enter your full name" },
      { type: "email", label: "Email Address", required: true, placeholder: "Enter email" },
      { type: "tel", label: "Phone Number", required: true, placeholder: "Enter phone number" },
      { type: "text", label: "Position Applied For", required: true, placeholder: "Job title" },
      { type: "select", label: "Experience Level", required: true, options: ["Entry Level", "Mid Level", "Senior Level", "Executive"] },
      { type: "file", label: "Resume/CV", required: true, accept: ".pdf,.doc,.docx" },
      { type: "file", label: "Cover Letter", accept: ".pdf,.doc,.docx" },
      { type: "textarea", label: "Why do you want to work here?", required: true, rows: 4 },
      { type: "number", label: "Expected Salary", placeholder: "Enter amount" },
      { type: "date", label: "Available Start Date", required: true }
    ],
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z"
  },
  {
    id: 4,
    name: "Customer Feedback",
    description: "Customer satisfaction survey with rating system",
    category: "Survey",
    thumbnail: "/templates/customer-feedback.jpg",
    fields: [
      { type: "text", label: "Customer Name", required: true, placeholder: "Enter your name" },
      { type: "email", label: "Email Address", required: true, placeholder: "Enter email" },
      { type: "select", label: "Service Used", required: true, options: ["Product Support", "Sales", "Technical Support", "Billing"] },
      { type: "radio", label: "Overall Satisfaction", required: true, options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] },
      { type: "range", label: "Rate Our Service (1-10)", min: 1, max: 10, step: 1 },
      { type: "checkbox", label: "What did you like?", options: ["Fast Response", "Knowledgeable Staff", "Easy Process", "Good Communication"] },
      { type: "textarea", label: "Additional Comments", placeholder: "Please share any additional feedback", rows: 4 },
      { type: "radio", label: "Would you recommend us?", required: true, options: ["Definitely Yes", "Probably Yes", "Not Sure", "Probably No", "Definitely No"] }
    ],
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z"
  },
  {
    id: 5,
    name: "Newsletter Signup",
    description: "Simple newsletter subscription form with preferences",
    category: "Marketing",
    thumbnail: "/templates/newsletter-signup.jpg",
    fields: [
      { type: "text", label: "First Name", required: true, placeholder: "Enter first name" },
      { type: "text", label: "Last Name", required: true, placeholder: "Enter last name" },
      { type: "email", label: "Email Address", required: true, placeholder: "Enter email address" },
      { type: "checkbox", label: "Interests", options: ["Technology", "Business", "Marketing", "Design", "Development"] },
      { type: "select", label: "Frequency", required: true, options: ["Daily", "Weekly", "Monthly"] },
      { type: "checkbox", label: "Agreement", required: true, options: ["I agree to receive newsletters and promotional emails"] }
    ],
    createdAt: "2024-01-19T11:30:00Z",
    updatedAt: "2024-01-19T11:30:00Z"
  },
  {
    id: 6,
    name: "Product Order Form",
    description: "Order form for products with quantity and shipping details",
    category: "E-commerce",
    thumbnail: "/templates/product-order.jpg",
    fields: [
      { type: "text", label: "Customer Name", required: true, placeholder: "Enter full name" },
      { type: "email", label: "Email Address", required: true, placeholder: "Enter email" },
      { type: "tel", label: "Phone Number", required: true, placeholder: "Enter phone" },
      { type: "select", label: "Product", required: true, options: ["Basic Plan", "Professional Plan", "Enterprise Plan"] },
      { type: "number", label: "Quantity", required: true, min: 1, placeholder: "Enter quantity" },
      { type: "textarea", label: "Shipping Address", required: true, placeholder: "Enter complete shipping address", rows: 3 },
      { type: "select", label: "Shipping Method", required: true, options: ["Standard (5-7 days)", "Express (2-3 days)", "Overnight"] },
      { type: "radio", label: "Payment Method", required: true, options: ["Credit Card", "PayPal", "Bank Transfer"] },
      { type: "textarea", label: "Special Instructions", placeholder: "Any special delivery instructions", rows: 2 }
    ],
    createdAt: "2024-01-20T13:20:00Z",
    updatedAt: "2024-01-20T13:20:00Z"
  },
  {
    id: 7,
    name: "Workshop Registration",
    description: "Registration form for workshops and training sessions",
    category: "Education",
    thumbnail: "/templates/workshop-registration.jpg",
    fields: [
      { type: "text", label: "Participant Name", required: true, placeholder: "Enter full name" },
      { type: "email", label: "Email Address", required: true, placeholder: "Enter email" },
      { type: "tel", label: "Contact Number", required: true, placeholder: "Enter phone number" },
      { type: "text", label: "Organization/Company", placeholder: "Enter organization name" },
      { type: "text", label: "Job Title", placeholder: "Enter job title" },
      { type: "select", label: "Workshop Track", required: true, options: ["Beginner", "Intermediate", "Advanced"] },
      { type: "checkbox", label: "Sessions of Interest", options: ["Technical Skills", "Leadership", "Communication", "Project Management"] },
      { type: "radio", label: "Experience Level", required: true, options: ["Beginner (0-2 years)", "Intermediate (3-5 years)", "Advanced (5+ years)"] },
      { type: "textarea", label: "Learning Objectives", placeholder: "What do you hope to achieve?", rows: 3 },
      { type: "checkbox", label: "Accessibility Needs", options: ["Wheelchair Access", "Sign Language Interpreter", "Large Print Materials", "None"] }
    ],
    createdAt: "2024-01-21T08:45:00Z",
    updatedAt: "2024-01-21T08:45:00Z"
  },
  {
    id: 8,
    name: "Support Ticket",
    description: "Customer support request form with priority levels",
    category: "Support",
    thumbnail: "/templates/support-ticket.jpg",
    fields: [
      { type: "text", label: "Your Name", required: true, placeholder: "Enter your name" },
      { type: "email", label: "Email Address", required: true, placeholder: "Enter email" },
      { type: "text", label: "Account/Customer ID", placeholder: "Enter account ID if available" },
      { type: "select", label: "Issue Category", required: true, options: ["Technical Issue", "Billing Question", "Feature Request", "Bug Report", "General Inquiry"] },
      { type: "select", label: "Priority Level", required: true, options: ["Low", "Medium", "High", "Urgent"] },
      { type: "text", label: "Subject", required: true, placeholder: "Brief description of issue" },
      { type: "textarea", label: "Detailed Description", required: true, placeholder: "Please describe the issue in detail", rows: 5 },
      { type: "file", label: "Attachments", accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx", multiple: true },
      { type: "select", label: "Preferred Contact Method", options: ["Email", "Phone", "Live Chat"] }
    ],
    createdAt: "2024-01-22T15:10:00Z",
    updatedAt: "2024-01-22T15:10:00Z"
  }
];

// Utility function to add realistic delay
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const templateService = {
  // Get all templates
  async getAll() {
    await delay(400);
    return [...mockTemplates];
  },

  // Get template by ID
  async getById(id) {
    await delay(200);
    const template = mockTemplates.find(t => t.id === parseInt(id));
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }
    return { ...template };
  },

  // Create new template
  async create(templateData) {
    await delay(500);
    const newTemplate = {
      id: Date.now(), // Simple ID generation
      ...templateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockTemplates.push(newTemplate);
    return { ...newTemplate };
  },

  // Update existing template
  async update(id, templateData) {
    await delay(400);
    const index = mockTemplates.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    mockTemplates[index] = {
      ...mockTemplates[index],
      ...templateData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...mockTemplates[index] };
  },

  // Delete template
  async delete(id) {
    await delay(300);
    const index = mockTemplates.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    const deletedTemplate = mockTemplates.splice(index, 1)[0];
    return { ...deletedTemplate };
  },

  // Get templates by category
  async getByCategory(category) {
    await delay(300);
    const filtered = mockTemplates.filter(t => 
      t.category.toLowerCase() === category.toLowerCase()
    );
    return [...filtered];
  },

  // Search templates
  async search(query) {
    await delay(350);
    const searchTerm = query.toLowerCase();
    const filtered = mockTemplates.filter(t => 
      t.name.toLowerCase().includes(searchTerm) ||
      t.description.toLowerCase().includes(searchTerm) ||
      t.category.toLowerCase().includes(searchTerm)
    );
    return [...filtered];
  }
};

export default templateService;