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
    } catch (err) {
      setError("Failed to load form. Please try again.");
    } finally {
      setLoading(false);
    }
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
        onFieldsChange={setFields}
        onSave={handleSave}
        formName={formName}
        selectedFieldId={selectedFieldId}
        onFieldSelect={setSelectedFieldId}
      />
      <FieldPropertiesPanel
        selectedFieldId={selectedFieldId}
        fields={fields}
        onFieldsChange={setFields}
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