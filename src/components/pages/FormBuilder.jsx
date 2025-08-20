import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import PublishFormModal from "@/components/molecules/PublishFormModal";
import { formService } from "@/services/api/formService";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import SaveFormModal from "@/components/molecules/SaveFormModal";
import FieldPropertiesPanel from "@/components/organisms/FieldPropertiesPanel";
import FieldLibrary from "@/components/organisms/FieldLibrary";
import FormBuilderCanvas from "@/components/organisms/FormBuilderCanvas";

const FormBuilder = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState([]);
  const [formStyle, setFormStyle] = useState({
    primaryColor: '#8B7FFF',
    fontFamily: 'Inter',
    formWidth: 'medium'
  });
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
const [currentForm, setCurrentForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    recipients: []
  });
const [thankYouSettings, setThankYouSettings] = useState({
    useCustom: false,
    message: "Thank you for your submission!",
    redirectUrl: "",
    showCreateFormButton: true
  });
  // History management for undo/redo
  const [history, setHistory] = useState([{ formName: "", fields: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    
    if (formId) {
      loadForm();
    } else if (templateId) {
      loadTemplate(parseInt(templateId));
    }
  }, [formId]);

const loadTemplate = async (templateId) => {
    try {
      setError("");
      setLoading(true);
      const { templateService } = await import('@/services/api/templateService');
      const template = await templateService.getById(templateId);
      
      // Generate fields with unique IDs
      const templateFields = template.fields.map((field, index) => ({
        id: Date.now() + index,
        ...field
      }));
      
      setFormName(template.name);
      setFields(templateFields);
      setFormStyle({
primaryColor: '#8B7FFF',
        fontFamily: 'Inter',
        formWidth: 'medium'
      });
      
      setNotificationSettings({
        enabled: false,
        recipients: []
      });
      
      // Initialize history with template data
      const initialState = { formName: template.name, fields: templateFields };
      setHistory([initialState]);
      setHistoryIndex(0);
      setCanUndo(false);
      setCanRedo(false);
      
      toast.success(`Template "${template.name}" loaded successfully!`);
    } catch (error) {
      setError("Failed to load template");
      toast.error("Failed to load template");
    }
    setLoading(false);
  };

const loadForm = async () => {
    try {
      setError("");
      setLoading(true);
      const form = await formService.getById(parseInt(formId));
      setFormName(form.name);
      setFields(form.fields || []);
setFormStyle(form.style || {
        primaryColor: '#8B7FFF',
        fontFamily: 'Inter',
        formWidth: 'medium'
      });
      
setNotificationSettings(form.notifications || {
        enabled: false,
        recipients: []
      });
      setThankYouSettings(form.thankYou || {
        useCustom: false,
        message: "Thank you for your submission!",
        redirectUrl: "",
        showCreateFormButton: true
      });
      
      setCurrentForm(form);
      setIsEditing(true);
      // Initialize history with loaded form
      const initialState = { formName: form.name || "", fields: form.fields || [] };
      setHistory([initialState]);
      setHistoryIndex(0);
      setCanUndo(false);
      setCanRedo(false);
    } catch (error) {
      setError("Failed to load form");
      toast.error("Failed to load form");
    }
    setLoading(false);
  };

  // Save current state to history
const saveToHistory = (newFormName, newFields) => {
    const newState = { 
      formName: newFormName, 
      fields: JSON.parse(JSON.stringify(newFields)),
      notifications: JSON.parse(JSON.stringify(notificationSettings)),
      thankYou: JSON.parse(JSON.stringify(thankYouSettings))
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    // Limit history size to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
    setCanUndo(true);
    setCanRedo(false);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
const prevState = history[newIndex];
      
      setFormName(prevState.formName);
      setFields(prevState.fields);
setNotificationSettings(prevState.notifications || { enabled: false, recipients: [] });
      setThankYouSettings(prevState.thankYou || { useCustom: false, message: "Thank you for your submission!", redirectUrl: "", showCreateFormButton: true });
      setHistoryIndex(newIndex);
      setCanUndo(newIndex > 0);
      setCanRedo(true);
      
      toast.success("Undo successful");
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
setFormName(nextState.formName);
      setFields(nextState.fields);
setNotificationSettings(nextState.notifications || { enabled: false, recipients: [] });
      setThankYouSettings(nextState.thankYou || { useCustom: false, message: "Thank you for your submission!", redirectUrl: "", showCreateFormButton: true });
      setHistoryIndex(newIndex);
      setCanUndo(true);
      setCanRedo(newIndex < history.length - 1);
      
      toast.success("Redo successful");
    }
  };
// Calculate form steps based on page breaks
  const getFormSteps = () => {
    const steps = [];
    let currentStepFields = [];
    
    fields.forEach(field => {
      if (field.type === 'page-break') {
        if (currentStepFields.length > 0) {
          steps.push([...currentStepFields]);
          currentStepFields = [];
        }
      } else {
        currentStepFields.push(field);
      }
    });
    
    // Add remaining fields as the last step
    if (currentStepFields.length > 0) {
      steps.push(currentStepFields);
    }
    
    return steps.length > 0 ? steps : [[]];
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          handleUndo();
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Enhanced field change handler with history tracking
  const handleFieldsChange = (newFields) => {
    setFields(newFields);
    saveToHistory(formName, newFields);
  };

  // Enhanced form name change handler with history tracking
const handleFormNameChange = (newName) => {
    setFormName(newName);
    saveToHistory(newName, fields);
};

  const handleNotificationSettingsChange = (newSettings) => {
    setNotificationSettings(newSettings);
    saveToHistory(formName, fields);
};

  const handleThankYouSettingsChange = (newSettings) => {
    setThankYouSettings(newSettings);
    saveToHistory(formName, fields);
  };

// Enhanced style change handler with history tracking
  const handleStyleChange = (newStyle) => {
    setFormStyle(newStyle);
    saveToHistory(formName, fields);
  };

  const handleSave = () => {
    if (fields.length === 0) {
      toast.error("Please add at least one field to your form");
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveForm = async (name) => {
    try {
const formData = {
        name,
        fields,
style: formStyle,
        notifications: notificationSettings,
        thankYou: thankYouSettings,
        createdAt: isEditing ? undefined : new Date().toISOString()
      };

if (isEditing) {
        const updatedForm = await formService.update(parseInt(formId), formData);
        setCurrentForm(updatedForm);
        toast.success("Form updated successfully!");
      } else {
        const newForm = await formService.create(formData);
        setCurrentForm(newForm);
        toast.success("Form saved successfully!");
      }

      navigate("/");
    } catch (err) {
      toast.error("Failed to save form. Please try again.");
    }
};

  const handlePublish = async () => {
    if (!currentForm) {
      toast.error("Please save the form first");
      return;
    }
    
    try {
      const publishedForm = await formService.publish(currentForm.Id);
      setCurrentForm(publishedForm);
      setShowPublishModal(true);
      toast.success("Form published successfully!");
    } catch (err) {
      toast.error("Failed to publish form. Please try again.");
    }
  };

  const handleUnpublish = async () => {
    if (!currentForm) return;
    
    try {
      const unpublishedForm = await formService.unpublish(currentForm.Id);
      setCurrentForm(unpublishedForm);
      toast.success("Form unpublished successfully!");
    } catch (err) {
      toast.error("Failed to unpublish form. Please try again.");
    }
  };

  if (loading) return <Loading type="builder" />;
  if (error) return <Error message={error} onRetry={loadForm} />;

return (
    <div className="h-full flex bg-surface">
      <FieldLibrary />
<FormBuilderCanvas
        fields={fields}
        onFieldsChange={handleFieldsChange}
        onSave={handleSave}
        formName={formName}
        onFormNameChange={handleFormNameChange}
        selectedFieldId={selectedFieldId}
        onFieldSelect={setSelectedFieldId}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        currentForm={currentForm}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onShowPublishModal={() => setShowPublishModal(true)}
        formStyle={formStyle}
        onStyleChange={handleStyleChange}
notificationSettings={notificationSettings}
        onNotificationSettingsChange={handleNotificationSettingsChange}
        thankYouSettings={thankYouSettings}
        onThankYouSettingsChange={handleThankYouSettingsChange}
        formSteps={getFormSteps()}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />
      <FieldPropertiesPanel
        selectedFieldId={selectedFieldId}
        fields={fields}
        onFieldsChange={handleFieldsChange}
        onFieldSelect={setSelectedFieldId}
      />
      
      <SaveFormModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveForm}
        currentName={formName}
/>
      
      <PublishFormModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        form={currentForm}
        onUnpublish={handleUnpublish}
      />
    </div>
  );
};

export default FormBuilder;