import React, { useRef, useState } from "react";
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
  onStyleChange
}) => {
const [dragOverIndex, setDragOverIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('design');
const canvasRef = useRef(null);
  const [draggedFieldId, setDraggedFieldId] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Calculate which position to insert at
    let insertIndex = fields.length;
    for (let i = 0; i < fields.length; i++) {
      const fieldElement = canvas.children[i];
      if (fieldElement) {
        const fieldRect = fieldElement.getBoundingClientRect();
        const fieldY = fieldRect.top - rect.top;
        if (y < fieldY + fieldRect.height / 2) {
          insertIndex = i;
          break;
        }
      }
    }
    setDragOverIndex(insertIndex);
  };

  const handleDragLeave = (e) => {
    if (!canvasRef.current?.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

const handleDrop = (e) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDraggedFieldId(null);
    
    const transferData = e.dataTransfer.getData("application/json");
    if (!transferData) return;
    
    const data = JSON.parse(transferData);
    const insertIndex = dragOverIndex !== null ? dragOverIndex : fields.length;
    const newFields = [...fields];
    
    if (data.isReorder && data.fieldId) {
      // Handle field reordering
      const draggedFieldIndex = fields.findIndex(f => f.Id === data.fieldId);
      if (draggedFieldIndex === -1) return;
      
      const draggedField = fields[draggedFieldIndex];
      
      // Remove from old position
      newFields.splice(draggedFieldIndex, 1);
      
      // Calculate new insertion index (adjust for removal if needed)
      let targetIndex = insertIndex;
      if (draggedFieldIndex < insertIndex) {
        targetIndex = insertIndex - 1;
      }
      
      // Insert at new position
      newFields.splice(targetIndex, 0, draggedField);
    } else {
      // Handle new field from library
const newField = {
        Id: Date.now(),
        type: data.type,
        label: data.label,
        placeholder: data.placeholder || "",
        required: false,
        helpText: "",
        options: data.options || [],
        min: data.min || (data.type === "number" ? 0 : undefined),
        max: data.max || (data.type === "number" ? 100 : undefined),
        maxRating: data.maxRating || (data.type === "rating" ? 5 : undefined),
        acceptedTypes: data.acceptedTypes || (data.type === "file" ? ".pdf,.doc,.docx,.jpg,.png" : undefined)
      };
      
      newFields.splice(insertIndex, 0, newField);
    }
    
    onFieldsChange(newFields);
  };

  const handleFieldDragStart = (e, fieldId) => {
    setDraggedFieldId(fieldId);
    
    const dragData = {
      isReorder: true,
      fieldId: fieldId
    };
    
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
    
    // Create drag preview
    const dragPreview = e.target.cloneNode(true);
    dragPreview.style.transform = 'rotate(5deg)';
    dragPreview.style.opacity = '0.8';
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, e.offsetX, e.offsetY);
    
    // Clean up preview after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const handleFieldDragEnd = (e) => {
    setDraggedFieldId(null);
  };
  const removeField = (fieldId) => {
    onFieldsChange(fields.filter(field => field.Id !== fieldId));
  };

  const updateField = (fieldId, updates) => {
    onFieldsChange(fields.map(field => 
      field.Id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const moveField = (fromIndex, toIndex) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    onFieldsChange(newFields);
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
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
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
        ) : (
          // Design Tab Content (Form Canvas)
          <div
            ref={canvasRef}
            className={`bg-white rounded-xl shadow-card p-8 min-h-96 transition-all duration-200 ${
              dragOverIndex !== null ? "border-2 border-primary-400 border-dashed" : "border border-gray-200"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
          {fields.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <ApperIcon name="MousePointer2" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Drop form fields here</p>
              <p>Drag fields from the library to start building your form</p>
            </div>
          ) : (
            <div className="space-y-4">
{fields.map((field, index) => (
                <React.Fragment key={field.Id}>
                  {/* Drop indicator */}
                  {dragOverIndex === index && (
                    <div className="h-1 bg-primary-400 rounded-full mb-2 animate-pulse shadow-sm" />
                  )}
                <motion.div
                  key={field.Id}
                  layout
                  draggable
                  onDragStart={(e) => handleFieldDragStart(e, field.Id)}
                  onDragEnd={handleFieldDragEnd}
                  className={`group relative p-4 border rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing ${
                    draggedFieldId === field.Id 
                      ? 'opacity-50 transform scale-95 border-primary-400 shadow-lg' 
                      : selectedFieldId === field.Id 
                        ? 'border-primary-500 bg-primary-50 shadow-md hover:border-primary-400' 
                        : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={() => !draggedFieldId && onFieldSelect(field.Id)}
                  whileHover={{ scale: draggedFieldId === field.Id ? 0.95 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Drag handle indicator */}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ApperIcon name="GripVertical" size={16} className="text-gray-400" />
                  </div>
                  {dragOverIndex === index && (
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
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
                          className="font-medium text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                          onClick={() => onFieldSelect(field.Id)}
                        >
                          {field.label || 'Click to edit label'}
                        </div>
                        <label className="flex items-center gap-1 text-sm text-gray-500">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.Id, { required: e.target.checked })}
                            className="rounded"
                          />
                          Required
                        </label>
</div>
                      
                      <div 
                        className="w-full text-sm text-gray-500 cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                        onClick={() => onFieldSelect(field.Id)}
                      >
                        {field.placeholder || 'Click to edit placeholder'}
                      </div>
                      {field.type === "select" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Options:</label>
                          {field.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
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
                              />
                              <button
                                onClick={() => {
                                  const newOptions = field.options.filter((_, i) => i !== optionIndex);
                                  updateField(field.Id, { options: newOptions });
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <ApperIcon name="X" className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [...field.options, ""];
                              updateField(field.Id, { options: newOptions });
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            + Add option
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeField(field.Id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                      <div className="cursor-move p-2 text-gray-400 hover:text-gray-600">
                        <ApperIcon name="GripVertical" className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  {dragOverIndex === fields.length && index === fields.length - 1 && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                  )}
</motion.div>
                </React.Fragment>
              ))}
            </div>
)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilderCanvas;