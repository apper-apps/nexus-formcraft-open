import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';

const FieldPropertiesPanel = ({ selectedFieldId, fields, onFieldsChange, onFieldSelect, notificationSettings, onNotificationSettingsChange, thankYouSettings, onThankYouSettingsChange, formSteps, currentStep, onStepChange }) => {
const [localLabel, setLocalLabel] = useState('');
  const [localPlaceholder, setLocalPlaceholder] = useState('');
  const [localRequired, setLocalRequired] = useState(false);
  const [localHelpText, setLocalHelpText] = useState('');
const [localOptions, setLocalOptions] = useState([]);
  const [localMin, setLocalMin] = useState('');
  const [localMax, setLocalMax] = useState('');
  const [localMaxRating, setLocalMaxRating] = useState(5);
  const [localAcceptedTypes, setLocalAcceptedTypes] = useState('');
  const [localShowCondition, setLocalShowCondition] = useState({
    enabled: false,
    fieldId: '',
    operator: 'equals',
    value: ''
  });
const selectedField = fields.find(field => field.Id === selectedFieldId);
  const availableFields = fields.filter(field => field.Id !== selectedFieldId);

useEffect(() => {
    if (selectedField) {
      setLocalLabel(selectedField.label || '');
      setLocalPlaceholder(selectedField.placeholder || '');
      setLocalRequired(selectedField.required || false);
      setLocalHelpText(selectedField.helpText || '');
      setLocalOptions(selectedField.options || []);
      setLocalMin(selectedField.min || '');
      setLocalMax(selectedField.max || '');
      setLocalMaxRating(selectedField.maxRating || 5);
setLocalAcceptedTypes(selectedField.acceptedTypes || '');
      setLocalShowCondition(selectedField.showCondition || {
        enabled: false,
        fieldId: '',
        operator: 'equals',
        value: ''
      });
    } else {
      setLocalLabel('');
      setLocalPlaceholder('');
      setLocalRequired(false);
      setLocalHelpText('');
      setLocalOptions([]);
      setLocalMin('');
      setLocalMax('');
      setLocalMaxRating(5);
setLocalAcceptedTypes('');
      setLocalShowCondition({
        enabled: false,
        fieldId: '',
        operator: 'equals',
        value: ''
      });
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

  const handleOptionsChange = (value) => {
    const options = value.split('\n').filter(opt => opt.trim());
    setLocalOptions(options);
    updateField({ options });
  };

  const handleMinChange = (value) => {
    setLocalMin(value);
    updateField({ min: value ? parseFloat(value) : undefined });
  };

  const handleMaxChange = (value) => {
    setLocalMax(value);
    updateField({ max: value ? parseFloat(value) : undefined });
  };

  const handleMaxRatingChange = (value) => {
    setLocalMaxRating(value);
    updateField({ maxRating: parseInt(value) });
  };

  const handleAcceptedTypesChange = (value) => {
    setLocalAcceptedTypes(value);
    updateField({ acceptedTypes: value });
  };
function handleShowConditionChange(updates) {
    const newCondition = { ...localShowCondition, ...updates };
    setLocalShowCondition(newCondition);
    updateField({ showCondition: newCondition });
    toast.success('Show/hide condition updated');
  }
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

const getFieldOptions = (fieldId) => {
    const field = fields.find(f => f.Id === fieldId);
    if (!field) return [];
    
    if (field.type === 'select' || field.type === 'radio') {
      return field.options || [];
    } else if (field.type === 'checkbox') {
      return ['true', 'false'];
    }
    return [];
  };

const [activeTab, setActiveTab] = useState(selectedFieldId ? 'field' : 'settings');

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header with Tabs */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 font-display">
            Properties
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
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('field')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'field'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ApperIcon name="Settings" size={14} />
              Field
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ApperIcon name="Sliders" size={14} />
              Form
            </div>
          </button>
        </div>
        
        {selectedField && activeTab === 'field' && (
          <p className="text-sm text-gray-500 mt-2">
            Editing {selectedField.type} field
          </p>
        )}
      </div>

{/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'field' ? (
          selectedField ? (
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
                    selectedField.type === 'phone' ? 'Phone' :
                    selectedField.type === 'radio' ? 'Circle' :
                    selectedField.type === 'number' ? 'Hash' :
                    selectedField.type === 'date' ? 'Calendar' :
                    selectedField.type === 'file' ? 'Upload' :
                    selectedField.type === 'rating' ? 'Star' :
                    selectedField.type === 'page-break' ? 'SeparatorHorizontal' : 'Type'
                  }
                  size={16} 
                  className="text-gray-600" 
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {selectedField.type === 'page-break' ? 'Page Break' : `${selectedField.type} Field`}
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
{['text', 'email', 'textarea', 'number', 'phone'].includes(selectedField.type) && (
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

            {/* Options for Radio and Select */}
            {['radio', 'select'].includes(selectedField.type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <textarea
                  value={localOptions.join('\n')}
                  onChange={(e) => handleOptionsChange(e.target.value)}
                  placeholder="Enter each option on a new line"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter each option on a separate line
                </p>
              </div>
            )}

            {/* Min/Max for Number fields */}
            {selectedField.type === 'number' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Value
                  </label>
                  <Input
                    type="number"
                    value={localMin}
                    onChange={(e) => handleMinChange(e.target.value)}
                    placeholder="Min value"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Value
                  </label>
                  <Input
                    type="number"
                    value={localMax}
                    onChange={(e) => handleMaxChange(e.target.value)}
                    placeholder="Max value"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Max Rating for Rating fields */}
            {selectedField.type === 'rating' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Rating
                </label>
                <select
                  value={localMaxRating}
                  onChange={(e) => handleMaxRatingChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} Stars</option>
                  ))}
                </select>
              </div>
            )}

            {/* File Types for File Upload */}
            {selectedField.type === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accepted File Types
                </label>
                <Input
                  value={localAcceptedTypes}
                  onChange={(e) => handleAcceptedTypesChange(e.target.value)}
                  placeholder=".pdf,.doc,.docx,.jpg,.png"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Specify file extensions separated by commas
                </p>
              </div>
            )}

{/* Page Break Title - Only for page-break type */}
            {selectedField.type === 'page-break' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Title
                </label>
                <Input
                  value={selectedField.stepTitle || ''}
                  onChange={(e) => updateField({ stepTitle: e.target.value })}
                  placeholder="Enter step title (optional)"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional title for this step in the multi-step form
                </p>
              </div>
            )}

            {/* Help Text Input - Only for non-page-break fields */}
            {selectedField.type !== 'page-break' && (
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
            )}

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
{/* Show/Hide Logic Section */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <ApperIcon name="Eye" size={16} />
                Show/Hide Logic
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableCondition"
                    checked={localShowCondition.enabled}
                    onChange={(e) => handleShowConditionChange({ enabled: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="enableCondition" className="text-sm text-gray-700">
                    Enable conditional display
                  </label>
                </div>

                {localShowCondition.enabled && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="text-sm text-gray-600 mb-3">
                      Show this field only when:
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Field
                        </label>
                        <select
                          value={localShowCondition.fieldId}
                          onChange={(e) => handleShowConditionChange({ 
                            fieldId: e.target.value,
                            value: '' // Reset value when field changes
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select field...</option>
                          {availableFields.map(field => (
                            <option key={field.Id} value={field.Id}>
                              {field.label || 'Untitled Field'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Condition
                        </label>
                        <select
                          value={localShowCondition.operator}
                          onChange={(e) => handleShowConditionChange({ operator: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="equals">equals</option>
                          <option value="not_equals">does not equal</option>
                          <option value="contains">contains</option>
                          <option value="is_empty">is empty</option>
                          <option value="is_not_empty">is not empty</option>
                        </select>
                      </div>

                      {localShowCondition.operator !== 'is_empty' && localShowCondition.operator !== 'is_not_empty' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Value
                          </label>
                          {localShowCondition.fieldId && getFieldOptions(localShowCondition.fieldId).length > 0 ? (
                            <select
                              value={localShowCondition.value}
                              onChange={(e) => handleShowConditionChange({ value: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                              <option value="">Select value...</option>
                              {getFieldOptions(localShowCondition.fieldId).map(option => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              value={localShowCondition.value}
                              onChange={(e) => handleShowConditionChange({ value: e.target.value })}
                              placeholder="Enter value..."
                              className="text-sm"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {localShowCondition.fieldId && (
                      <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                        <strong>Preview:</strong> This field will be shown when "
                        {fields.find(f => f.Id === localShowCondition.fieldId)?.label || 'Selected field'}" 
                        {' '}{localShowCondition.operator === 'equals' ? 'equals' : 
                             localShowCondition.operator === 'not_equals' ? 'does not equal' :
                             localShowCondition.operator === 'contains' ? 'contains' :
                             localShowCondition.operator === 'is_empty' ? 'is empty' : 'is not empty'}
                        {(localShowCondition.operator !== 'is_empty' && localShowCondition.operator !== 'is_not_empty') && 
                          ` "${localShowCondition.value || '[value]'}"`}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
          )
        ) : (
          // Form Settings Tab
          <div className="p-6 space-y-8">
            {/* Thank You Page Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name="Heart" size={16} />
                Thank You Page
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useCustomThankYou"
                    checked={thankYouSettings?.useCustom || false}
                    onChange={(e) => onThankYouSettingsChange?.({
                      ...thankYouSettings,
                      useCustom: e.target.checked
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="useCustomThankYou" className="text-sm text-gray-700">
                    Customize thank you page
                  </label>
                </div>

                {thankYouSettings?.useCustom && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    {/* Custom Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thank You Message
                      </label>
                      <textarea
                        value={thankYouSettings?.message || "Thank you for your submission!"}
                        onChange={(e) => onThankYouSettingsChange?.({
                          ...thankYouSettings,
                          message: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter your custom thank you message"
                      />
                    </div>

                    {/* Redirect URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Redirect URL (Optional)
                      </label>
                      <Input
                        value={thankYouSettings?.redirectUrl || ""}
                        onChange={(e) => onThankYouSettingsChange?.({
                          ...thankYouSettings,
                          redirectUrl: e.target.value
                        })}
                        placeholder="https://example.com/success"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Users will be redirected here after 2 seconds
                      </p>
                    </div>

                    {/* Show Create Form Button */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showCreateFormButton"
                        checked={thankYouSettings?.showCreateFormButton !== false}
                        onChange={(e) => onThankYouSettingsChange?.({
                          ...thankYouSettings,
                          showCreateFormButton: e.target.checked
                        })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="showCreateFormButton" className="text-sm text-gray-700">
                        Show "Create Your Own Form" button
                      </label>
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ApperIcon name="CheckCircle" className="w-6 h-6 text-success" />
                    </div>
                    <h4 className="text-lg font-display font-bold text-gray-900 mb-2">
                      Thank you!
                    </h4>
                    <p className="text-gray-600 mb-4 text-sm">
                      {thankYouSettings?.useCustom 
                        ? (thankYouSettings.message || "Thank you for your submission!")
                        : "Your form has been submitted successfully."
                      }
                    </p>
                    
                    {thankYouSettings?.useCustom && thankYouSettings.redirectUrl && (
                      <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-800 flex items-center justify-center gap-1">
                        <ApperIcon name="Clock" size={12} />
                        Redirecting in 2 seconds...
                      </div>
                    )}
                    
                    {(!thankYouSettings?.useCustom || thankYouSettings?.showCreateFormButton !== false) && (
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">
                        Create Your Own Form
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Settings */}
            {notificationSettings && onNotificationSettingsChange && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="Bell" size={16} />
                  Email Notifications
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enableNotifications"
                      checked={notificationSettings?.enabled || false}
                      onChange={(e) => onNotificationSettingsChange?.({
                        ...notificationSettings,
                        enabled: e.target.checked
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="enableNotifications" className="text-sm text-gray-700">
                      Send email notifications
                    </label>
                  </div>

                  {notificationSettings?.enabled && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipients
                      </label>
                      <textarea
                        value={(notificationSettings?.recipients || []).join('\n')}
                        onChange={(e) => onNotificationSettingsChange?.({
                          ...notificationSettings,
                          recipients: e.target.value.split('\n').filter(email => email.trim())
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter email addresses, one per line"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        These recipients will be notified when someone submits the form
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
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