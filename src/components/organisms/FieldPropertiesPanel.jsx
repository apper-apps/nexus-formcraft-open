import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

const FieldPropertiesPanel = ({ selectedFieldId, fields, onFieldsChange, onFieldSelect }) => {
  const [localLabel, setLocalLabel] = useState('');
  const [localPlaceholder, setLocalPlaceholder] = useState('');
const [localRequired, setLocalRequired] = useState(false);
  const [localHelpText, setLocalHelpText] = useState('');
  const selectedField = fields.find(field => field.Id === selectedFieldId);

  useEffect(() => {
    if (selectedField) {
      setLocalLabel(selectedField.label || '');
      setLocalPlaceholder(selectedField.placeholder || '');
setLocalRequired(selectedField.required || false);
      setLocalHelpText(selectedField.helpText || '');
    } else {
      setLocalLabel('');
      setLocalPlaceholder('');
      setLocalRequired(false);
      setLocalHelpText('');
    }
  }, [selectedField]);

  const updateField = (updates) => {
    if (!selectedFieldId) return;

    const updatedFields = fields.map(field =>
      field.Id === selectedFieldId ? { ...field, ...updates } : field
    );
    onFieldsChange(updatedFields);
    toast.success('Field updated successfully');
  };

  const handleLabelChange = (value) => {
    setLocalLabel(value);
    updateField({ label: value });
  };

  const handlePlaceholderChange = (value) => {
    setLocalPlaceholder(value);
    updateField({ placeholder: value });
  };
const handleRequiredChange = (value) => {
    setLocalRequired(value);
    updateField({ required: value });
  };

  const handleHelpTextChange = (value) => {
    setLocalHelpText(value);
    updateField({ helpText: value });
  };

  const deleteField = () => {
    if (!selectedFieldId) return;
    
    const updatedFields = fields.filter(field => field.Id !== selectedFieldId);
    onFieldsChange(updatedFields);
    onFieldSelect(null);
    toast.success('Field deleted successfully');
  };

  const duplicateField = () => {
    if (!selectedField) return;

    const maxId = Math.max(...fields.map(f => f.Id), 0);
    const duplicatedField = {
      ...selectedField,
      Id: maxId + 1,
      label: `${selectedField.label || 'Field'} Copy`
    };

    onFieldsChange([...fields, duplicatedField]);
    onFieldSelect(duplicatedField.Id);
    toast.success('Field duplicated successfully');
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 font-display">
            Field Properties
          </h3>
          {selectedFieldId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFieldSelect(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ApperIcon name="X" size={16} />
            </Button>
          )}
        </div>
        {selectedField && (
          <p className="text-sm text-gray-500 mt-1">
            Editing {selectedField.type} field
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {selectedField ? (
          <div className="p-6 space-y-6">
            {/* Field Type Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Type
              </label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <ApperIcon 
                  name={
                    selectedField.type === 'text' ? 'Type' :
                    selectedField.type === 'email' ? 'Mail' :
                    selectedField.type === 'textarea' ? 'FileText' :
                    selectedField.type === 'select' ? 'ChevronDown' :
                    selectedField.type === 'checkbox' ? 'Square' :
                    selectedField.type === 'radio' ? 'Circle' :
                    selectedField.type === 'file' ? 'Upload' :
                    selectedField.type === 'number' ? 'Hash' :
                    selectedField.type === 'date' ? 'Calendar' :
                    selectedField.type === 'time' ? 'Clock' : 'Type'
                  } 
                  size={16} 
                  className="text-gray-600" 
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {selectedField.type} Field
                </span>
              </div>
            </div>

            {/* Label Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Label *
              </label>
              <Input
                value={localLabel}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Enter field label"
                className="w-full"
              />
            </div>

            {/* Placeholder Input */}
            {['text', 'email', 'textarea', 'number'].includes(selectedField.type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placeholder Text
                </label>
                <Input
                  value={localPlaceholder}
                  onChange={(e) => handlePlaceholderChange(e.target.value)}
                  placeholder="Enter placeholder text"
                  className="w-full"
                />
              </div>
)}

            {/* Help Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Help Text
              </label>
              <Input
                value={localHelpText}
                onChange={(e) => handleHelpTextChange(e.target.value)}
                placeholder="Enter help text for users"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Additional guidance or instructions for this field
              </p>
            </div>
            {/* Required Toggle */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={localRequired}
                  onChange={(e) => handleRequiredChange(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Required Field</span>
                  <p className="text-xs text-gray-500">Users must fill this field</p>
                </div>
              </label>
            </div>

            {/* Field Actions */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={duplicateField}
                className="w-full justify-center"
              >
                <ApperIcon name="Copy" size={16} className="mr-2" />
                Duplicate Field
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteField}
                className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ApperIcon name="Trash2" size={16} className="mr-2" />
                Delete Field
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ApperIcon name="Settings" size={24} className="text-gray-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  No Field Selected
                </h4>
                <p className="text-sm text-gray-500">
                  Click on a field in the canvas to edit its properties
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Select fields to customize labels, placeholders, and validation
        </div>
      </div>
    </div>
  );
};

export default FieldPropertiesPanel;