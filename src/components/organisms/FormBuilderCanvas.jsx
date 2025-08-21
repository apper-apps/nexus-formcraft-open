import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const FormBuilderCanvas = ({ 
  fields, 
  onFieldsChange, 
  onSave, 
  formName, 
  onFormNameChange,
  selectedFieldId, 
  onFieldSelect,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  currentForm,
  onPublish,
  onUnpublish,
  onShowPublishModal,
  formStyle,
  onStyleChange,
  notificationSettings,
  onNotificationSettingsChange,
  formSteps,
  currentStep,
  onStepChange
}) => {
const [dragOverIndex, setDragOverIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('design');
  const [emailInput, setEmailInput] = useState('');
  const canvasRef = useRef(null);
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [draggedFromLibrary, setDraggedFromLibrary] = useState(false);

const handleDragOver = (e) => {
    e.preventDefault();
    
    // Determine if this is from library or reordering
    const transferData = e.dataTransfer.getData("application/json");
    let isFromLibrary = true;
    
    try {
      const data = JSON.parse(transferData);
      isFromLibrary = !data.isReorder;
    } catch (err) {
      isFromLibrary = true;
    }
    
    e.dataTransfer.dropEffect = isFromLibrary ? 'copy' : 'move';
    setIsDraggedOver(true);
    setDraggedFromLibrary(isFromLibrary);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Calculate which position to insert at with improved accuracy
    let insertIndex = fields.length;
    const fieldElements = canvas.querySelectorAll('[data-field-id]');
    
    for (let i = 0; i < fieldElements.length; i++) {
      const fieldElement = fieldElements[i];
      const fieldRect = fieldElement.getBoundingClientRect();
      const fieldY = fieldRect.top - rect.top;
      const fieldCenter = fieldY + fieldRect.height / 2;
      
      if (y < fieldCenter) {
        insertIndex = i;
        break;
      }
    }
    
    // Don't set drag over index if it's the same as current position (for reordering)
    if (!isFromLibrary) {
      const draggedIndex = fields.findIndex(f => f.Id === draggedFieldId);
      if (draggedIndex !== -1 && (insertIndex === draggedIndex || insertIndex === draggedIndex + 1)) {
        setDragOverIndex(null);
        return;
      }
    }
    
    setDragOverIndex(insertIndex);
  };

const handleDragLeave = (e) => {
    if (!canvasRef.current?.contains(e.relatedTarget)) {
      setDragOverIndex(null);
      setIsDraggedOver(false);
      setDraggedFromLibrary(false);
    }
  };

// Comprehensive field validation function
const validateFieldData = (data) => {
    const supportedTypes = [
      'text', 'email', 'number', 'textarea', 'select', 'radio', 
      'checkbox', 'date', 'time', 'url', 'tel', 'phone', 'password', 
      'file', 'rating', 'slider', 'page-break', 'heading', 'paragraph'
    ];

    // Validate field type
    if (!data.type || !supportedTypes.includes(data.type)) {
      return {
        isValid: false,
        error: `Unsupported field type: ${data.type || 'undefined'}. Supported types: ${supportedTypes.join(', ')}`
      };
    }

    // Validate required properties for specific field types
    if (data.type === 'select' || data.type === 'radio') {
      if (!data.options || !Array.isArray(data.options) || data.options.length === 0) {
        return {
          isValid: false,
          error: `${data.type} fields require at least one option`
        };
      }
    }

    if (data.type === 'number') {
      if (data.min !== undefined && data.max !== undefined && data.min > data.max) {
        return {
          isValid: false,
          error: 'Number field minimum value cannot be greater than maximum value'
        };
      }
    }

    if (data.type === 'rating') {
      if (data.maxRating && (data.maxRating < 1 || data.maxRating > 10)) {
        return {
          isValid: false,
          error: 'Rating field maximum rating must be between 1 and 10'
        };
      }
    }

    return { isValid: true };
  };

  // Enhanced error recovery function
  const handleDragError = (error, fallbackData = null) => {
    console.error('Drag operation error:', error);
    
    // Show user-friendly error message
    toast.error(`Drag failed: ${error}. Try using click-to-add instead.`, {
      autoClose: 5000,
      closeOnClick: true
    });

    // Offer fallback if data is available
    if (fallbackData) {
      setTimeout(() => {
        toast.info(
          <div className="flex flex-col gap-2">
            <span>Would you like to add this field anyway?</span>
            <Button
              size="sm"
              onClick={() => addFieldWithFallback(fallbackData)}
              className="w-fit"
            >
              Add Field
            </Button>
          </div>,
          { autoClose: false, closeOnClick: false }
        );
      }, 1000);
    }
  };

  // Fallback field addition method
  const addFieldWithFallback = (fieldData) => {
    try {
      const validation = validateFieldData(fieldData);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      const newField = createFieldFromData(fieldData, fields.length);
      const newFields = [...fields, newField];
      onFieldsChange(newFields);
      
      toast.success(`${fieldData.label || newField.label} added successfully`);
      setTimeout(() => {
        onFieldSelect(newField.Id);
      }, 100);
    } catch (error) {
      toast.error('Failed to add field. Please try again.');
    }
  };

  // Helper function to create field from data
  const createFieldFromData = (data, insertIndex) => {
    return {
      Id: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000),
      type: data.type,
      label: data.label || `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Field`,
      placeholder: data.placeholder || `Enter ${data.type === 'textarea' ? 'text' : data.type}`,
      required: false,
      helpText: "",
      options: data.type === "select" || data.type === "radio" ? (data.options && data.options.length > 0 ? data.options : ["Option 1", "Option 2"]) : [],
      min: data.type === "number" ? (data.min !== undefined ? data.min : 0) : undefined,
      max: data.type === "number" ? (data.max !== undefined ? data.max : 100) : undefined,
      maxRating: data.type === "rating" ? (data.maxRating || 5) : undefined,
      acceptedTypes: data.type === "file" ? (data.acceptedTypes || ".pdf,.doc,.docx,.jpg,.png") : undefined,
      stepTitle: data.type === "page-break" ? (data.stepTitle || "New Step") : undefined,
      showCondition: null,
      validationRules: [],
      position: insertIndex
    };
  };

const handleDrop = (e) => {
    e.preventDefault();
    const finalDragOverIndex = dragOverIndex;
    
    // Reset all drag states
    setDragOverIndex(null);
    setDraggedFieldId(null);
    setDragStartPosition(null);
    setIsDraggedOver(false);
    setDraggedFromLibrary(false);
    
    try {
      const transferData = e.dataTransfer.getData("application/json");
      if (!transferData) {
        handleDragError('No data received from drag operation');
        return;
      }
      
      let data;
      try {
        data = JSON.parse(transferData);
      } catch (err) {
        handleDragError('Invalid drag data format', null);
        return;
      }
      
      // Comprehensive validation for new fields
      if (!data.isReorder) {
        const validation = validateFieldData(data);
        if (!validation.isValid) {
          handleDragError(validation.error, data);
          return;
        }
      }
      
      const insertIndex = finalDragOverIndex !== null ? finalDragOverIndex : fields.length;
      const newFields = [...fields];
      
      if (data.isReorder && data.fieldId) {
        // Handle field reordering with enhanced validation
        const draggedFieldIndex = fields.findIndex(f => f.Id === data.fieldId);
        if (draggedFieldIndex === -1) {
          handleDragError('Could not find field to reorder');
          return;
        }
        
        // Don't reorder if dropping in the same position
        if (insertIndex === draggedFieldIndex || insertIndex === draggedFieldIndex + 1) {
          toast.info('Field is already in this position');
          return;
        }
        
        const draggedField = fields[draggedFieldIndex];
        
        // Validate field before moving
        if (!draggedField || !draggedField.type) {
          handleDragError('Invalid field data for reordering');
          return;
        }
        
        // Remove from old position
        newFields.splice(draggedFieldIndex, 1);
        
        // Calculate new insertion index (adjust for removal if needed)
        let targetIndex = insertIndex;
        if (draggedFieldIndex < insertIndex) {
          targetIndex = insertIndex - 1;
        }
        
        // Insert at new position
        newFields.splice(targetIndex, 0, draggedField);
        
        // Update the fields immediately for live preview
        onFieldsChange(newFields);
        
        // Show success feedback with position info
        toast.success(`Field moved to position ${targetIndex + 1}`);
      } else {
        // Handle new field from library with enhanced validation
        try {
          const newField = createFieldFromData(data, insertIndex);
          
          // Additional validation for edge cases
          if (fields.length > 50) {
            toast.warning('Form has many fields. Consider using page breaks for better user experience.');
          }
          
          // Check for duplicate field names
          const duplicateLabel = fields.find(f => 
            f.label.toLowerCase() === newField.label.toLowerCase()
          );
          if (duplicateLabel) {
            newField.label = `${newField.label} (${fields.length + 1})`;
          }
          
          newFields.splice(insertIndex, 0, newField);
          onFieldsChange(newFields);
          
          // Show success feedback with field details
          toast.success(
            <div className="flex flex-col gap-1">
              <span className="font-medium">{newField.label} added successfully</span>
              <span className="text-sm opacity-75">Position: {insertIndex + 1} of {newFields.length}</span>
            </div>
          );
          
          // Auto-select the new field with delay for better UX
          setTimeout(() => {
            onFieldSelect(newField.Id);
          }, 100);
        } catch (error) {
          handleDragError('Failed to create field from drag data', data);
        }
      }
    } catch (error) {
      handleDragError('Unexpected error during drop operation');
    }
  };

const handleFieldDragStart = (e, fieldId) => {
    setDraggedFieldId(fieldId);
    const fieldIndex = fields.findIndex(f => f.Id === fieldId);
    setDragStartPosition(fieldIndex);
    
    const dragData = {
      isReorder: true,
      fieldId: fieldId
    };
    
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
    
    // Create enhanced drag preview
    const sourceElement = e.currentTarget;
    const dragPreview = sourceElement.cloneNode(true);
    
    // Style the drag preview
    dragPreview.style.position = 'absolute';
    dragPreview.style.top = '-1000px';
    dragPreview.style.left = '-1000px';
    dragPreview.style.width = `${sourceElement.offsetWidth}px`;
    dragPreview.style.transform = 'rotate(2deg) scale(0.95)';
    dragPreview.style.opacity = '0.9';
    dragPreview.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
    dragPreview.style.border = '2px solid #8B7FFF';
    dragPreview.style.borderRadius = '12px';
    dragPreview.style.pointerEvents = 'none';
    dragPreview.style.zIndex = '9999';
    
    document.body.appendChild(dragPreview);
    
    // Set drag image with better positioning
    const rect = sourceElement.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setDragImage(dragPreview, offsetX, offsetY);
    
    // Clean up preview
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
      }
    }, 1);
  };

const handleFieldDragEnd = (e) => {
    // Enhanced drag end with error recovery
    setDraggedFieldId(null);
    setDragOverIndex(null);
    setDragStartPosition(null);
    
    // Check if drag was successful (no data transfer means potential failure)
    const transferData = e.dataTransfer?.getData("application/json");
    if (!transferData && e.dataTransfer?.effectAllowed !== 'none') {
      toast.warning('Drag operation may have failed. Try using click-to-add as an alternative.');
    }
  };
// Enhanced field management with validation and error handling
  const removeField = (fieldId) => {
    try {
      const fieldToRemove = fields.find(f => f.Id === fieldId);
      if (!fieldToRemove) {
        toast.error('Field not found for removal');
        return;
      }
      
      const newFields = fields.filter(field => field.Id !== fieldId);
      onFieldsChange(newFields);
      toast.success(`${fieldToRemove.label} removed from form`);
    } catch (error) {
      toast.error('Failed to remove field. Please try again.');
    }
  };

  const updateField = (fieldId, updates) => {
    try {
      const fieldExists = fields.find(f => f.Id === fieldId);
      if (!fieldExists) {
        toast.error('Field not found for update');
        return;
      }
      
      // Validate updates if they include field type changes
      if (updates.type && updates.type !== fieldExists.type) {
        const validation = validateFieldData({ ...fieldExists, ...updates });
        if (!validation.isValid) {
          toast.error(validation.error);
          return;
        }
      }
      
      onFieldsChange(fields.map(field => 
        field.Id === fieldId ? { ...field, ...updates } : field
      ));
    } catch (error) {
      toast.error('Failed to update field. Please try again.');
    }
  };

  const moveField = (fromIndex, toIndex) => {
    try {
      if (fromIndex < 0 || fromIndex >= fields.length || toIndex < 0 || toIndex >= fields.length) {
        toast.error('Invalid field position for move operation');
        return;
      }
      
      const newFields = [...fields];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);
      onFieldsChange(newFields);
      toast.success(`Field moved from position ${fromIndex + 1} to ${toIndex + 1}`);
    } catch (error) {
      toast.error('Failed to move field. Please try again.');
    }
  };

// Style application
  // Click-to-add fallback method for when drag and drop fails
  const handleFieldClickToAdd = (fieldType) => {
    try {
      const fieldData = {
        type: fieldType,
        label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`
      };
      
      addFieldWithFallback(fieldData);
    } catch (error) {
      toast.error('Failed to add field. Please try again.');
    }
  };

  // Style application
  const getFormWidthClass = () => {
    switch (formStyle.formWidth) {
      case 'narrow': return 'max-w-lg';
      case 'wide': return 'max-w-4xl';
      default: return 'max-w-2xl';
    }
  };

  const getFontFamilyClass = () => {
    switch (formStyle.fontFamily) {
      case 'Plus Jakarta Sans': return 'font-display';
      case 'Georgia': return 'font-serif';
      case 'Courier New': return 'font-mono';
      default: return 'font-sans';
    }
  };

  return (
    <div 
      className="flex-1 bg-surface/50 p-6"
      style={{
        '--primary-color': formStyle.primaryColor,
        '--primary-50': formStyle.primaryColor + '0D',
        '--primary-100': formStyle.primaryColor + '1A',
        '--primary-200': formStyle.primaryColor + '33',
        '--primary-300': formStyle.primaryColor + '4D',
        '--primary-400': formStyle.primaryColor + '66',
        '--primary-500': formStyle.primaryColor,
        '--primary-600': formStyle.primaryColor + 'E6',
        '--primary-700': formStyle.primaryColor + 'CC'
      }}
    >
<div className={`${getFormWidthClass()} mx-auto ${getFontFamilyClass()}`}>
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            value={formName}
            onChange={(e) => onFormNameChange(e.target.value)}
            placeholder="Untitled Form"
            className="text-2xl font-display font-bold text-gray-900 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-primary-300 rounded-lg px-3 py-1 transition-all duration-200"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
              <Button
                onClick={onUndo}
                disabled={!canUndo}
                variant="ghost"
                size="sm"
                className="inline-flex items-center gap-1 px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <ApperIcon name="Undo2" className="w-4 h-4" />
                Undo
              </Button>
              <Button
                onClick={onRedo}
                disabled={!canRedo}
                variant="ghost"
                size="sm"
                className="inline-flex items-center gap-1 px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <ApperIcon name="Redo2" className="w-4 h-4" />
                Redo
              </Button>
            </div>
<div className="flex items-center gap-2">
              <Button onClick={onSave} className="inline-flex items-center gap-2">
                <ApperIcon name="Save" className="w-4 h-4" />
                Save Form
              </Button>
              {currentForm && (
                <>
                  {currentForm.isPublished ? (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={onShowPublishModal}
                        variant="secondary"
                        className="inline-flex items-center gap-2"
                      >
                        <ApperIcon name="Globe" className="w-4 h-4" />
                        View Link
                      </Button>
                      <Button
                        onClick={onUnpublish}
                        variant="secondary"
                        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700"
                      >
                        <ApperIcon name="EyeOff" className="w-4 h-4" />
                        Unpublish
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={onPublish}
                      variant="secondary"
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
                    >
                      <ApperIcon name="Globe" className="w-4 h-4" />
                      Publish Form
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
</div>

        {/* Tab Navigation */}
<div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('design')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'design'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ApperIcon name="Layout" className="w-4 h-4" />
                Design
              </div>
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'style'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ApperIcon name="Palette" className="w-4 h-4" />
                Style
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ApperIcon name="Mail" className="w-4 h-4" />
                Notifications
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'style' ? (
          // Style Tab Content
          <div className="bg-white rounded-xl shadow-card p-8 space-y-8">
            <div className="text-center">
              <h3 className="text-lg font-display font-bold text-gray-900 mb-2">Form Styling</h3>
              <p className="text-gray-600">Customize the appearance of your form</p>
            </div>

            {/* Primary Color */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Primary Color</label>
              <div className="grid grid-cols-6 gap-3">
                {[
                  '#8B7FFF', '#3B82F6', '#10B981', '#F59E0B',
                  '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16',
                  '#F97316', '#EC4899', '#6366F1', '#14B8A6'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => onStyleChange({ ...formStyle, primaryColor: color })}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      formStyle.primaryColor === color
                        ? 'border-gray-900 scale-110 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Custom:</span>
                <input
                  type="color"
                  value={formStyle.primaryColor}
                  onChange={(e) => onStyleChange({ ...formStyle, primaryColor: e.target.value })}
                  className="w-12 h-8 border border-gray-200 rounded cursor-pointer"
                />
                <span className="text-sm font-mono text-gray-500">{formStyle.primaryColor}</span>
              </div>
            </div>

            {/* Font Family */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Font Family</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Inter', label: 'Inter (Default)', preview: 'The quick brown fox' },
                  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', preview: 'The quick brown fox' },
                  { value: 'Georgia', label: 'Georgia', preview: 'The quick brown fox' },
                  { value: 'Courier New', label: 'Courier New', preview: 'The quick brown fox' }
                ].map((font) => (
                  <button
                    key={font.value}
                    onClick={() => onStyleChange({ ...formStyle, fontFamily: font.value })}
                    className={`p-4 text-left border rounded-lg transition-all ${
                      formStyle.fontFamily === font.value
                        ? 'border-2 border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`font-medium text-gray-900 mb-1 ${
                      font.value === 'Plus Jakarta Sans' ? 'font-display' :
                      font.value === 'Georgia' ? 'font-serif' :
                      font.value === 'Courier New' ? 'font-mono' : 'font-sans'
                    }`}>
                      {font.label}
                    </div>
                    <div className={`text-sm text-gray-500 ${
                      font.value === 'Plus Jakarta Sans' ? 'font-display' :
                      font.value === 'Georgia' ? 'font-serif' :
                      font.value === 'Courier New' ? 'font-mono' : 'font-sans'
                    }`}>
                      {font.preview}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Width */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Form Width</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'narrow', label: 'Narrow', description: '512px max width' },
                  { value: 'medium', label: 'Medium', description: '672px max width' },
                  { value: 'wide', label: 'Wide', description: '896px max width' }
                ].map((width) => (
                  <button
                    key={width.value}
                    onClick={() => onStyleChange({ ...formStyle, formWidth: width.value })}
                    className={`p-4 text-center border rounded-lg transition-all ${
                      formStyle.formWidth === width.value
                        ? 'border-2 border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">{width.label}</div>
                    <div className="text-sm text-gray-500">{width.description}</div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-full bg-primary-500 rounded-full ${
                          width.value === 'narrow' ? 'w-1/2' :
                          width.value === 'medium' ? 'w-3/4' : 'w-full'
                        }`} 
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-3">Preview</div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div 
                  className={`mx-auto p-4 bg-white rounded-lg shadow-sm ${getFontFamilyClass()}`}
                  style={{ 
                    borderColor: formStyle.primaryColor,
                    maxWidth: formStyle.formWidth === 'narrow' ? '320px' : 
                             formStyle.formWidth === 'wide' ? '480px' : '400px'
                  }}
                >
                  <h4 className="font-bold text-gray-900 mb-3">Sample Form</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        style={{ borderColor: formStyle.primaryColor + '40' }}
                        placeholder="Enter your name"
                      />
                    </div>
                    <button 
                      className="px-4 py-2 text-white rounded-md font-medium"
                      style={{ backgroundColor: formStyle.primaryColor }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
) : activeTab === 'notifications' ? (
          // Notifications Tab Content
          <div className="bg-white rounded-xl shadow-card p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600 mt-1">Get notified when someone submits this form</p>
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notificationSettings.enabled}
                  onChange={(e) => onNotificationSettingsChange({
                    ...notificationSettings,
                    enabled: e.target.checked
                  })}
                  className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">Enable notifications</span>
              </label>
            </div>

            {notificationSettings.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email Addresses
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const email = emailInput.trim();
                          if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            if (!notificationSettings.recipients.includes(email)) {
                              onNotificationSettingsChange({
                                ...notificationSettings,
                                recipients: [...notificationSettings.recipients, email]
                              });
                              setEmailInput('');
                            }
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const email = emailInput.trim();
                        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                          if (!notificationSettings.recipients.includes(email)) {
                            onNotificationSettingsChange({
                              ...notificationSettings,
                              recipients: [...notificationSettings.recipients, email]
                            });
                            setEmailInput('');
                          }
                        }
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      <ApperIcon name="Plus" className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to add an email address</p>
                </div>

                {notificationSettings.recipients.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
Current Recipients ({notificationSettings.recipients.length})
                    </label>
                    <div className="space-y-2">
                      {notificationSettings.recipients.map((email, index) => (
                        <div key={email} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <ApperIcon name="Mail" className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{email}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newRecipients = notificationSettings.recipients.filter((_, i) => i !== index);
                              onNotificationSettingsChange({
                                ...notificationSettings,
                                recipients: newRecipients
                              });
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <ApperIcon name="X" className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ApperIcon name="Info" className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">How it works</p>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Email notifications will be sent whenever someone submits this form</li>
                        <li>• All specified recipients will receive the notification</li>
                        <li>• Notifications include form submission details and timestamp</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
) : (
          <>
            {/* Design Tab Content (Form Canvas) */}
{/* Main Canvas Area */}
            <div
              ref={canvasRef}
              className={`bg-white rounded-xl shadow-card p-8 min-h-96 transition-all duration-300 relative ${
                isDraggedOver && draggedFromLibrary ? "bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-400 border-dashed shadow-xl" :
                isDraggedOver ? "bg-primary-25 border-2 border-primary-300 border-dashed shadow-lg" :
                draggedFieldId ? "bg-primary-25" : "bg-white"
              } ${
                dragOverIndex !== null ? "shadow-2xl" : "border border-gray-200"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
{fields.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ApperIcon name="MousePointer2" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Drop form fields here</p>
              <p className="mb-6">Drag fields from the library to start building your form</p>
              
              {/* Fallback field addition methods */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6 max-w-md mx-auto">
                <p className="text-sm font-medium text-gray-600 mb-3">
                  Drag and drop not working? Try these alternatives:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFieldClickToAdd('text')}
                    className="text-xs"
                  >
                    <ApperIcon name="Type" size={14} className="mr-1" />
                    Add Text
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFieldClickToAdd('email')}
                    className="text-xs"
                  >
                    <ApperIcon name="Mail" size={14} className="mr-1" />
                    Add Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFieldClickToAdd('select')}
                    className="text-xs"
                  >
                    <ApperIcon name="ChevronDown" size={14} className="mr-1" />
                    Add Select
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Double-click on library fields also works as a backup method
                </p>
              </div>
            </div>
          ) : (
            <>
              {formSteps.length > 1 ? (
                // Multi-step form preview
                <div className="space-y-6">
                  {/* Step Navigation */}
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700">
                        Step {currentStep} of {formSteps.length}
                      </span>
<div className="flex space-x-1">
                        {formSteps.map((_, index) => (
                          <button
                            key={`step-${index + 1}`}
                            onClick={() => onStepChange(index + 1)}
                            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                              currentStep === index + 1
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${(currentStep / formSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Step Fields */}
                  <div className="space-y-4">
                    <div className="text-center py-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Step {currentStep}: Form Fields
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formSteps[currentStep - 1]?.length || 0} fields in this step
                      </p>
                    </div>

                    {formSteps[currentStep - 1]?.map((field, index) => (
                      <React.Fragment key={field.Id}>
                        {dragOverIndex === index && draggedFieldId && (
                          <motion.div 
                            className="h-2 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full mx-4 shadow-sm"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            exit={{ scaleX: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                        
<motion.div
                          data-field-id={field.Id}
                          layout
                          draggable
                          onDragStart={(e) => handleFieldDragStart(e, field.Id)}
                          onDragEnd={handleFieldDragEnd}
                          className={`group relative p-4 border rounded-lg transition-all duration-200 ${
                            draggedFieldId === field.Id 
                              ? 'opacity-40 transform scale-98 border-primary-400 shadow-xl bg-primary-25 cursor-grabbing' 
                              : selectedFieldId === field.Id 
                                ? 'border-primary-500 bg-primary-50 shadow-md hover:border-primary-400 cursor-grab hover:cursor-grab' 
                                : 'border-gray-200 hover:border-primary-300 hover:shadow-md cursor-grab hover:cursor-grab'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: draggedFieldId === field.Id ? 0.4 : 1, 
                            y: 0,
                            scale: draggedFieldId === field.Id ? 0.98 : 1
                          }}
                          exit={{ opacity: 0, y: -20 }}
                          onClick={() => !draggedFieldId && onFieldSelect(field.Id)}
                          whileHover={{ 
                            scale: draggedFieldId === field.Id ? 0.98 : 1.01,
                            transition: { duration: 0.1 }
                          }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {/* Enhanced drag handle indicator */}
{/* Enhanced drag handle indicator */}
                          <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                            draggedFieldId === field.Id ? 'opacity-100 text-primary-500' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <ApperIcon name="GripVertical" size={16} className="text-gray-400 group-hover:text-primary-500" />
                          </div>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3 ml-6">
                              <div className="flex items-center gap-2">
                                <ApperIcon 
                                  name={field.type === "text" ? "Type" : 
                                        field.type === "email" ? "Mail" :
                                        field.type === "textarea" ? "FileText" :
                                        field.type === "select" ? "ChevronDown" :
                                        field.type === "checkbox" ? "Square" :
                                        field.type === "phone" ? "Phone" :
                                        field.type === "radio" ? "Circle" :
                                        field.type === "number" ? "Hash" :
                                        field.type === "date" ? "Calendar" :
                                        field.type === "file" ? "Upload" :
                                        field.type === "rating" ? "Star" : "Type"}
                                  className="w-4 h-4 text-gray-400"
                                />
                                <div 
                                  className="font-medium text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFieldSelect(field.Id);
                                  }}
                                >
                                  {field.label || 'Click to edit label'}
                                </div>
                                <label className="flex items-center gap-1 text-sm text-gray-500">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(field.Id, { required: e.target.checked })}
                                    className="rounded"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  Required
                                </label>
                              </div>
                              
                              <div 
                                className="w-full text-sm text-gray-500 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onFieldSelect(field.Id);
                                }}
                              >
                                {field.placeholder || 'Click to edit placeholder'}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const fieldLabel = field.label || field.type || 'Untitled field';
                                  const confirmDelete = window.confirm(
                                    `Are you sure you want to delete "${fieldLabel}"?\n\nThis action cannot be undone.`
                                  );
                                  if (confirmDelete) {
                                    removeField(field.Id);
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete field"
                              >
                                <ApperIcon name="X" size={16} className="text-gray-400 hover:text-red-500" />
                              </button>
                              <div 
                                className="cursor-move p-2 text-gray-400 hover:text-primary-500 transition-colors"
                                title="Drag to reorder"
                              >
                                <ApperIcon name="GripVertical" className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Show all page breaks */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-700 border-t pt-4">Page Break Elements</h4>
                    {fields.filter(field => field.type === 'page-break').map(field => (
                      <motion.div
                        key={field.Id}
                        data-field-id={field.Id}
                        draggable
                        onDragStart={(e) => handleFieldDragStart(e, field.Id)}
                        onDragEnd={handleFieldDragEnd}
                        className={`group relative p-4 border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg transition-all duration-200 ${
                          selectedFieldId === field.Id ? 'border-orange-500 bg-orange-100' : 'hover:border-orange-400'
                        }`}
                        onClick={() => onFieldSelect(field.Id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ApperIcon name="SeparatorHorizontal" className="w-5 h-5 text-orange-600" />
                            <div>
                              <div className="font-medium text-orange-900">
                                {field.stepTitle || 'Page Break'}
                              </div>
                              <div className="text-sm text-orange-700">
                                Splits form into multiple steps
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Remove this page break?')) {
                                  removeField(field.Id);
                                }
                              }}
                              className="p-2 text-orange-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <ApperIcon name="X" size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                // Single step form (original layout)
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <React.Fragment key={field.Id}>
                      {/* Enhanced drop indicator */}
                      {dragOverIndex === index && draggedFieldId && (
                        <motion.div 
                          className="h-2 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full mx-4 shadow-sm"
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          exit={{ scaleX: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      {field.type === 'page-break' ? (
                        // Page Break Element
                        <motion.div
                          data-field-id={field.Id}
                          layout
                          draggable
                          onDragStart={(e) => handleFieldDragStart(e, field.Id)}
                          onDragEnd={handleFieldDragEnd}
                          className={`group relative p-4 border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg transition-all duration-200 ${
                            draggedFieldId === field.Id 
                              ? 'opacity-40 transform scale-98 border-orange-400 shadow-xl cursor-grabbing' 
                              : selectedFieldId === field.Id 
                                ? 'border-orange-500 bg-orange-100 shadow-md cursor-grab' 
                                : 'hover:border-orange-400 hover:shadow-md cursor-grab'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: draggedFieldId === field.Id ? 0.4 : 1, 
                            y: 0,
                            scale: draggedFieldId === field.Id ? 0.98 : 1
                          }}
                          exit={{ opacity: 0, y: -20 }}
                          onClick={() => !draggedFieldId && onFieldSelect(field.Id)}
                          whileHover={{ 
                            scale: draggedFieldId === field.Id ? 0.98 : 1.01,
                            transition: { duration: 0.1 }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ApperIcon name="SeparatorHorizontal" className="w-5 h-5 text-orange-600" />
                              <div>
                                <div className="font-medium text-orange-900">
                                  {field.stepTitle || 'Page Break'}
                                </div>
                                <div className="text-sm text-orange-700">
                                  Splits form into multiple steps
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Remove this page break?')) {
                                    removeField(field.Id);
                                  }
                                }}
                                className="p-2 text-orange-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete page break"
                              >
                                <ApperIcon name="X" size={16} />
                              </button>
                              <div 
                                className="cursor-move p-2 text-orange-400 hover:text-orange-600 transition-colors"
                                title="Drag to reorder"
                              >
                                <ApperIcon name="GripVertical" className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        // Regular Field
<motion.div
                          data-field-id={field.Id}
                          layout
                          draggable
                          onDragStart={(e) => handleFieldDragStart(e, field.Id)}
                          onDragEnd={handleFieldDragEnd}
                          className={`group relative p-4 border rounded-lg transition-all duration-200 ${
                            draggedFieldId === field.Id 
                              ? 'opacity-40 transform scale-98 border-primary-400 shadow-xl bg-primary-25 cursor-grabbing' 
                              : selectedFieldId === field.Id 
                                ? 'border-primary-500 bg-primary-50 shadow-md hover:border-primary-400 cursor-grab hover:cursor-grab' 
                                : 'border-gray-200 hover:border-primary-300 hover:shadow-md cursor-grab hover:cursor-grab'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: draggedFieldId === field.Id ? 0.4 : 1, 
                            y: 0,
                            scale: draggedFieldId === field.Id ? 0.98 : 1
                          }}
                          exit={{ opacity: 0, y: -20 }}
                          onClick={() => !draggedFieldId && onFieldSelect(field.Id)}
                          whileHover={{ 
                            scale: draggedFieldId === field.Id ? 0.98 : 1.01,
                            transition: { duration: 0.1 }
                          }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {/* Enhanced drag handle indicator */}
                          <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                            draggedFieldId === field.Id ? 'opacity-100 text-primary-500' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <ApperIcon name="GripVertical" size={16} className="text-gray-400 group-hover:text-primary-500" />
                          </div>
                          
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3 ml-6">
                              <div className="flex items-center gap-2">
                                <ApperIcon 
                                  name={field.type === "text" ? "Type" : 
                                        field.type === "email" ? "Mail" :
                                        field.type === "textarea" ? "FileText" :
                                        field.type === "select" ? "ChevronDown" :
                                        field.type === "checkbox" ? "Square" :
                                        field.type === "phone" ? "Phone" :
                                        field.type === "radio" ? "Circle" :
                                        field.type === "number" ? "Hash" :
                                        field.type === "date" ? "Calendar" :
                                        field.type === "file" ? "Upload" :
                                        field.type === "rating" ? "Star" : "Type"}
                                  className="w-4 h-4 text-gray-400"
                                />
                                <div 
                                  className="font-medium text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFieldSelect(field.Id);
                                  }}
                                >
                                  {field.label || 'Click to edit label'}
                                </div>
                                <label className="flex items-center gap-1 text-sm text-gray-500">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(field.Id, { required: e.target.checked })}
                                    className="rounded"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  Required
                                </label>
                              </div>
                              
                              <div 
                                className="w-full text-sm text-gray-500 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onFieldSelect(field.Id);
                                }}
                              >
                                {field.placeholder || 'Click to edit placeholder'}
                              </div>
                              
                              {field.type === "select" && (
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Options:</label>
{field.options.map((option, optionIndex) => (
                                    <div key={`option-${field.Id}-${optionIndex}`} className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...field.options];
                                          newOptions[optionIndex] = e.target.value;
                                          updateField(field.Id, { options: newOptions });
                                        }}
                                        className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded"
                                        placeholder="Option text"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const newOptions = field.options.filter((_, i) => i !== optionIndex);
                                          updateField(field.Id, { options: newOptions });
                                        }}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                      >
                                        <ApperIcon name="X" className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newOptions = [...field.options, ""];
                                      updateField(field.Id, { options: newOptions });
                                    }}
                                    className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                                  >
                                    + Add option
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const fieldLabel = field.label || field.type || 'Untitled field';
                                  const confirmDelete = window.confirm(
                                    `Are you sure you want to delete "${fieldLabel}"?\n\nThis action cannot be undone.`
                                  );
                                  if (confirmDelete) {
                                    removeField(field.Id);
                                  }
                                }}
className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete field"
                              >
                                <ApperIcon name="X" size={16} className="text-gray-400 hover:text-red-500" />
                              </button>
                              <div 
                                className="cursor-move p-2 text-gray-400 hover:text-primary-500 transition-colors group-hover:bg-primary-50 rounded-lg"
                                title="Drag to reorder"
                              >
                                <ApperIcon name="GripVertical" className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </React.Fragment>
                  ))}
                  
                  {/* Final drop indicator */}
                  {dragOverIndex === fields.length && draggedFieldId && (
                    <motion.div 
                      className="h-2 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full mx-4 shadow-sm"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
)}
            </>
)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FormBuilderCanvas;