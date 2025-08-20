import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { formService } from "@/services/api/formService";
import ApperIcon from "@/components/ApperIcon";
import FormCard from "@/components/organisms/FormCard";
import FormTemplatesModal from "@/components/organisms/FormTemplatesModal";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await formService.getAll();
      setForms(data);
    } catch (err) {
      setError("Failed to load forms. Please try again.");
    } finally {
      setLoading(false);
    }
};

  const handleCreateNew = () => {
    setShowTemplatesModal(true);
  };

  const handleCloseTemplatesModal = () => {
    setShowTemplatesModal(false);
  };

  const handleStartBlank = () => {
    setShowTemplatesModal(false);
    navigate("/builder");
  };

  const handleShowTemplates = () => {
    setShowTemplatesModal(true);
  };

const handleEditForm = (form) => {
    navigate(`/builder/${form.Id}`);
  };

  const handleViewResponses = (form) => {
    navigate(`/form/${form.Id}/responses`);
  };

  const handleDeleteForm = async (formId) => {
    if (window.confirm("Are you sure you want to delete this form?")) {
      try {
        await formService.delete(formId);
        setForms(forms.filter(form => form.Id !== formId));
        toast.success("Form deleted successfully");
      } catch (err) {
        toast.error("Failed to delete form");
      }
    }
  };

  const handleDuplicateForm = async (form) => {
    try {
      const duplicatedForm = {
        ...form,
        name: `${form.name} (Copy)`,
        createdAt: new Date().toISOString()
      };
      delete duplicatedForm.Id;
      
      const newForm = await formService.create(duplicatedForm);
      setForms([newForm, ...forms]);
      toast.success("Form duplicated successfully");
    } catch (err) {
      toast.error("Failed to duplicate form");
    }
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadForms} />;

  return (
    <div className="p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your forms and create new ones
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-4 sm:mt-0"
        >
<Button onClick={handleCreateNew} className="w-full sm:w-auto">
            <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
            Create New Form
          </Button>
        </motion.div>
      </motion.div>

{forms.length === 0 ? (
        <Empty
          title="No forms created yet"
          description="Get started by creating your first form with our intuitive drag-and-drop builder or choose from our pre-built templates"
          actionLabel="Create Your First Form"
          onAction={handleCreateNew}
          icon="FormInput"
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {forms.map((form, index) => (
            <motion.div
              key={form.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
<FormCard
                form={form}
                onEdit={handleEditForm}
                onDelete={handleDeleteForm}
                onDuplicate={handleDuplicateForm}
                onViewResponses={handleViewResponses}
              />
            </motion.div>
          ))}
        </motion.div>
)}

      {/* Templates Modal */}
<FormTemplatesModal
        isOpen={showTemplatesModal}
        onClose={handleCloseTemplatesModal}
        onStartBlank={handleStartBlank}
      />
    </div>
  );
};

export default Dashboard;