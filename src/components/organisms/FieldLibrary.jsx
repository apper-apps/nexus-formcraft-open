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
    // Set drag data
    e.dataTransfer.setData("application/json", JSON.stringify(field));
    e.dataTransfer.effectAllowed = "copy";
    
    // Create enhanced drag preview
    const sourceElement = e.currentTarget;
    const dragPreview = sourceElement.cloneNode(true);
    
    // Style the drag preview for better visual feedback
    dragPreview.style.position = 'absolute';
    dragPreview.style.top = '-1000px';
    dragPreview.style.left = '-1000px';
    dragPreview.style.width = `${sourceElement.offsetWidth}px`;
    dragPreview.style.transform = 'rotate(1deg) scale(1.05)';
    dragPreview.style.opacity = '0.95';
    dragPreview.style.boxShadow = '0 12px 32px rgba(139, 127, 255, 0.3)';
    dragPreview.style.border = '2px solid #8B7FFF';
    dragPreview.style.borderRadius = '12px';
    dragPreview.style.pointerEvents = 'none';
    dragPreview.style.zIndex = '9999';
    dragPreview.style.background = 'linear-gradient(135deg, #f4f2ff 0%, #ebe7ff 100%)';
    
    document.body.appendChild(dragPreview);
    
    // Set drag image with proper positioning
    const rect = sourceElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setDragImage(dragPreview, offsetX, offsetY);
    
    // Add dragging class to source element
    sourceElement.classList.add('dragging');
    
    // Clean up preview after drag starts
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
      }
    }, 1);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
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
            className="field-item p-4 select-none group relative"
            draggable
            onDragStart={(e) => handleDragStart(e, field)}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'grab' }}
            onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
            onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
          >
            {/* Drag handle indicator */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <ApperIcon name="GripVertical" size={14} className="text-gray-400 group-hover:text-primary-500" />
            </div>
            
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