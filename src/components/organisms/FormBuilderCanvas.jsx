import { useState, useRef } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const FormBuilderCanvas = ({ fields, onFieldsChange, onSave, formName }) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const canvasRef = useRef(null);

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
    
    const fieldData = JSON.parse(e.dataTransfer.getData("application/json"));
    
    // Create new field with unique ID
    const newField = {
      Id: Date.now(),
      type: fieldData.type,
      label: fieldData.label,
      placeholder: fieldData.placeholder || "",
      required: false,
      options: fieldData.options || []
    };

    // Insert at the calculated position
    const insertIndex = dragOverIndex !== null ? dragOverIndex : fields.length;
    const newFields = [...fields];
    newFields.splice(insertIndex, 0, newField);
    onFieldsChange(newFields);
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

  return (
    <div className="flex-1 bg-surface/50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            {formName || "Untitled Form"}
          </h2>
          <Button onClick={onSave} className="inline-flex items-center gap-2">
            <ApperIcon name="Save" className="w-4 h-4" />
            Save Form
          </Button>
        </div>

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
                <motion.div
                  key={field.Id}
                  layout
                  className="group relative p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
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
                                field.type === "checkbox" ? "Square" : "Type"}
                          className="w-4 h-4 text-gray-400"
                        />
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.Id, { label: e.target.value })}
                          className="font-medium text-gray-900 bg-transparent border-none outline-none p-0 focus:bg-gray-50 rounded px-2 py-1"
                          placeholder="Field label"
                        />
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
                      
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(e) => updateField(field.Id, { placeholder: e.target.value })}
                        className="w-full text-sm text-gray-500 bg-transparent border-none outline-none p-0 focus:bg-gray-50 rounded px-2 py-1"
                        placeholder="Placeholder text"
                      />

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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilderCanvas;