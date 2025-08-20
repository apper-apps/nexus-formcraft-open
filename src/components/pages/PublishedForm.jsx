import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { formService } from "@/services/api/formService";

const PublishedForm = () => {
  const { publishId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadForm();
  }, [publishId]);

  const loadForm = async () => {
    try {
      setError("");
      setLoading(true);
      const publishedForm = await formService.getByPublishId(publishId);
      setForm(publishedForm);
      
      // Initialize form data
      const initialData = {};
      publishedForm.fields.forEach(field => {
        initialData[field.Id] = field.type === "checkbox" ? false : "";
      });
      setFormData(initialData);
    } catch (err) {
      setError("Form not found or no longer available");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    form.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.Id];
        if (!value || (typeof value === "string" && !value.trim())) {
          errors.push(`${field.label} is required`);
        }
      }
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setSubmitting(true);
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
      toast.success("Form submitted successfully!");
    } catch (err) {
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.Id] || "";

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.Id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.Id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.Id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select an option...</option>
            {field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleFieldChange(field.Id, e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">{field.label}</span>
          </label>
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.Id, e.target.value)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.Id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.Id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadForm} />;

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-card p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name="CheckCircle" className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Thank you!
          </h2>
          <p className="text-gray-600 mb-6">
            Your form has been submitted successfully.
          </p>
          <Button onClick={() => navigate("/")} variant="secondary">
            Create Your Own Form
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-card p-8"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              {form.name}
            </h1>
            <p className="text-gray-600">
              Please fill out all required fields and submit the form.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map(field => (
              <div key={field.Id} className="space-y-2">
                {field.type !== "checkbox" && (
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                {renderField(field)}
                {field.helpText && (
                  <p className="text-sm text-gray-500">{field.helpText}</p>
                )}
              </div>
            ))}

            <div className="pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Send" className="w-4 h-4" />
                    Submit Form
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PublishedForm;