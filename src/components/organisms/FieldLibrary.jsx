import { motion } from "framer-motion";
import React from "react";
import ApperIcon from "@/components/ApperIcon";

const FieldLibrary = () => {
  const fieldTypes = [
    {
      type: "text",
      label: "Text Input",
      icon: "Type",
      description: "Single line text field",
      placeholder: "Enter text..."
    },
    {
      type: "email",
      label: "Email",
      icon: "Mail",
      description: "Email address field",
      placeholder: "Enter email..."
    },
    {
      type: "textarea",
      label: "Textarea",
      icon: "FileText",
      description: "Multi-line text field",
      placeholder: "Enter description..."
    },
    {
      type: "select",
      label: "Dropdown",
      icon: "ChevronDown",
      description: "Dropdown selection",
      options: ["Option 1", "Option 2", "Option 3"]
    },
    {
      type: "checkbox",
      label: "Checkbox",
      icon: "Square",
      description: "Single checkbox field",
placeholder: "Check this box"
    },
    {
      type: "phone",
      label: "Phone Number",
      icon: "Phone",
      description: "Phone number input field",
      placeholder: "Enter phone number..."
    },
    {
      type: "radio",
      label: "Radio Buttons",
      icon: "Circle",
      description: "Single choice from options",
      options: ["Option 1", "Option 2", "Option 3"]
    },
    {
      type: "number",
      label: "Number Input",
      icon: "Hash",
      description: "Numeric input field",
      placeholder: "Enter number...",
      min: 0,
      max: 100
    },
    {
      type: "date",
      label: "Date Picker",
      icon: "Calendar",
      description: "Date selection field"
    },
    {
      type: "file",
      label: "File Upload",
      icon: "Upload",
      description: "File upload field",
      acceptedTypes: ".pdf,.doc,.docx,.jpg,.png"
    },
    {
      type: "rating",
      label: "Rating Field",
      icon: "Star",
description: "Star rating field",
      maxRating: 5
    },
    {
      type: "page-break",
      label: "Page Break",
      icon: "SeparatorHorizontal",
      description: "Split form into multiple steps"
    }
  ];

  const handleDragStart = (e, field) => {
    e.dataTransfer.setData("application/json", JSON.stringify(field));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 p-6">
      <h3 className="text-lg font-display font-bold text-gray-900 mb-6">
        Field Library
      </h3>
      
      <div className="space-y-3">
        {fieldTypes.map((field, index) => (
          <motion.div
            key={field.type}
            className="field-item p-4"
            draggable
            onDragStart={(e) => handleDragStart(e, field)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <ApperIcon name={field.icon} className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {field.label}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                  {field.description}
                </p>
              </div>
              <ApperIcon name="Plus" className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
        <div className="flex items-center gap-2 mb-2">
          <ApperIcon name="Info" className="w-4 h-4 text-primary-600" />
          <h4 className="font-medium text-primary-900">How to use</h4>
        </div>
        <p className="text-sm text-primary-700 leading-relaxed">
          Drag fields from this library onto the form canvas to build your form. 
          Click on fields in the canvas to edit their properties.
        </p>
      </div>
    </div>
  );
};

export default FieldLibrary;