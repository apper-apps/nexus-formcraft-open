import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import FieldLibrary from "@/components/organisms/FieldLibrary";
import FormBuilderCanvas from "@/components/organisms/FormBuilderCanvas";
import FieldPropertiesPanel from "@/components/organisms/FieldPropertiesPanel";
import SaveFormModal from "@/components/molecules/SaveFormModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { formService } from "@/services/api/formService";

const FormBuilder = () => {
  const navigate = useNavigate();
  const { formId } = useParams();
const [formName, setFormName] = useState("");
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // History management for undo/redo
  const [history, setHistory] = useState([{ formName: "", fields: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    try {
      setError("");
      setLoading(true);
      const form = await formService.getById(parseInt(formId));
      setFormName(form.name);
setFields(form.fields || []);
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
    const newState = { formName: newFormName, fields: JSON.parse(JSON.stringify(newFields)) };
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
      setHistoryIndex(newIndex);
      setCanUndo(true);
      setCanRedo(newIndex < history.length - 1);
      
      toast.success("Redo successful");
    }
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
        createdAt: isEditing ? undefined : new Date().toISOString()
      };

      if (isEditing) {
        await formService.update(parseInt(formId), formData);
        toast.success("Form updated successfully!");
      } else {
        await formService.create(formData);
        toast.success("Form saved successfully!");
      }

      navigate("/");
    } catch (err) {
      toast.error("Failed to save form. Please try again.");
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
    </div>
  );
};

export default FormBuilder;