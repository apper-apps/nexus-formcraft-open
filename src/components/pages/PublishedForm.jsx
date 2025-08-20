import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { formService } from "@/services/api/formService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";

const PublishedForm = () => {
  const { publishId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
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
    
    // Clear field error when user starts typing
    if (fieldErrors[fieldId]) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  };

const validateForm = () => {
    const errors = [];
    const newFieldErrors = {};
    
    form.fields.forEach(field => {
      const value = formData[field.Id];
      let fieldError = null;
      
      // Required field validation
      if (field.required) {
        if (!value || (typeof value === "string" && !value.trim())) {
          fieldError = `${field.label} is required`;
          errors.push(fieldError);
        }
      }
      
      // Email format validation
      if (field.type === "email" && value && typeof value === "string" && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          fieldError = "Please enter a valid email address";
          errors.push(fieldError);
        }
      }
      
      // Number format validation
      if (field.type === "number" && value && typeof value === "string" && value.trim()) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          fieldError = "Please enter a valid number";
          errors.push(fieldError);
        } else {
          // Check min/max constraints
          if (field.min !== undefined && numValue < field.min) {
            fieldError = `Value must be at least ${field.min}`;
            errors.push(fieldError);
          }
          if (field.max !== undefined && numValue > field.max) {
            fieldError = `Value must be no more than ${field.max}`;
            errors.push(fieldError);
          }
        }
      }
      
      newFieldErrors[field.Id] = fieldError;
    });
    
    setFieldErrors(newFieldErrors);
    return errors;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error("Please correct the errors below before submitting");
      return;
    }

    setSubmitting(true);
    try {
      // Import response service dynamically to avoid circular dependency
      const { responseService } = await import('@/services/api/responseService');
      
      // Save form response
      await responseService.create(form.Id, formData);
      
      // Increment form submission count
      await formService.incrementSubmissionCount(form.Id);
      
      setSubmitted(true);
      toast.success(form.settings?.successMessage || "Form submitted successfully!");
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

const renderField = (field) => {
    const value = formData[field.Id] || "";
    const hasError = fieldErrors[field.Id];
    const baseInputClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200";
const errorClasses = hasError 
      ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
      : "border-gray-300 focus:border-[var(--primary-500,#8B7FFF)] focus:ring-[var(--primary-500,#8B7FFF)]";

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
            className={`${baseInputClasses} ${errorClasses}`}
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
            className={`${baseInputClasses} ${errorClasses} resize-vertical`}
          />
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.Id, e.target.value)}
            required={field.required}
            className={`${baseInputClasses} ${errorClasses}`}
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
            onChange={(e) => {
              // Only allow numeric input
              const inputValue = e.target.value;
              if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
                handleFieldChange(field.Id, inputValue);
              }
            }}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            required={field.required}
            className={`${baseInputClasses} ${errorClasses}`}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.Id, e.target.value)}
            required={field.required}
            className={`${baseInputClasses} ${errorClasses}`}
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
            className={`${baseInputClasses} ${errorClasses}`}
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
<div 
        className={`px-4 py-8 mx-auto ${
          form.style?.formWidth === 'narrow' ? 'max-w-lg' :
          form.style?.formWidth === 'wide' ? 'max-w-4xl' : 'max-w-2xl'
        } ${
          form.style?.fontFamily === 'Plus Jakarta Sans' ? 'font-display' :
          form.style?.fontFamily === 'Georgia' ? 'font-serif' :
          form.style?.fontFamily === 'Courier New' ? 'font-mono' : 'font-sans'
        }`}
        style={{
          '--primary-color': form.style?.primaryColor || '#8B7FFF',
          '--primary-50': (form.style?.primaryColor || '#8B7FFF') + '0D',
          '--primary-100': (form.style?.primaryColor || '#8B7FFF') + '1A',
          '--primary-200': (form.style?.primaryColor || '#8B7FFF') + '33',
          '--primary-300': (form.style?.primaryColor || '#8B7FFF') + '4D',
          '--primary-400': (form.style?.primaryColor || '#8B7FFF') + '66',
          '--primary-500': form.style?.primaryColor || '#8B7FFF',
          '--primary-600': (form.style?.primaryColor || '#8B7FFF') + 'E6',
          '--primary-700': (form.style?.primaryColor || '#8B7FFF') + 'CC'
        }}
      >
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
                {fieldErrors[field.Id] && (
                  <p className="text-sm text-red-600">{fieldErrors[field.Id]}</p>
                )}
                {field.helpText && !fieldErrors[field.Id] && (
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
                  form.settings?.submitButtonText || "Submit"
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