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
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
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
    
const visibleFields = getVisibleFields(form.fields, formData);
    visibleFields.forEach(field => {
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

  const evaluateCondition = (condition, formData) => {
    if (!condition || !condition.enabled || !condition.fieldId) {
      return true; // Show field if no condition is set
    }

    const fieldValue = formData[condition.fieldId];
    const { operator, value } = condition;

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return fieldValue && fieldValue.toString().toLowerCase().includes(value.toLowerCase());
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return true;
    }
  };

  const getVisibleFields = (fields, currentFormData) => {
    return fields.filter(field => evaluateCondition(field.showCondition, currentFormData));
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadForm} />;

if (submitted) {
    const thankYouSettings = form.thankYou || {
      useCustom: false,
      message: "Thank you for your submission!",
      redirectUrl: "",
      showCreateFormButton: true
    };

    // Handle redirect if URL is provided
    if (thankYouSettings.useCustom && thankYouSettings.redirectUrl) {
      setTimeout(() => {
        window.location.href = thankYouSettings.redirectUrl;
      }, 2000);
    }

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
            {thankYouSettings.useCustom ? "Thank you!" : "Thank you!"}
          </h2>
          <p className="text-gray-600 mb-6">
            {thankYouSettings.useCustom ? thankYouSettings.message : "Your form has been submitted successfully."}
          </p>
          
          {thankYouSettings.useCustom && thankYouSettings.redirectUrl && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
                <ApperIcon name="Clock" size={16} />
                Redirecting you in 2 seconds...
              </p>
            </div>
          )}
          
          {(!thankYouSettings.useCustom || thankYouSettings.showCreateFormButton) && (
            <Button onClick={() => navigate("/")} variant="secondary">
              Create Your Own Form
            </Button>
          )}
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

{(() => {
            // Calculate form steps
            const formSteps = [];
            let currentStepFields = [];
            
            form.fields.forEach(field => {
              if (field.type === 'page-break') {
                if (currentStepFields.length > 0) {
                  formSteps.push([...currentStepFields]);
                  currentStepFields = [];
                }
              } else {
                currentStepFields.push(field);
              }
            });
            
            // Add remaining fields as the last step
            if (currentStepFields.length > 0) {
              formSteps.push(currentStepFields);
            }
            
            // If no steps, show single step with all fields
            const steps = formSteps.length > 0 ? formSteps : [form.fields.filter(field => field.type !== 'page-break')];
            const isMultiStep = steps.length > 1;

            // Define validation function for current step
            const validateCurrentStep = () => {
              const currentStepFields = steps[currentStep - 1] || [];
              const errors = [];
              const newFieldErrors = {};
const visibleStepFields = getVisibleFields(currentStepFields, formData);
              visibleStepFields.forEach(field => {
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
              
              setFieldErrors(prev => ({ ...prev, ...newFieldErrors }));
              return errors;
            };

            const handleNext = () => {
              const validationErrors = validateCurrentStep();
              if (validationErrors.length > 0) {
                toast.error("Please correct the errors before continuing");
                return;
              }
              
              setCompletedSteps(prev => new Set([...prev, currentStep]));
              setCurrentStep(currentStep + 1);
              
              // Clear any field errors from previous steps
              const nextStepFieldIds = steps[currentStep]?.map(field => field.Id) || [];
              setFieldErrors(prev => {
                const newErrors = { ...prev };
                nextStepFieldIds.forEach(fieldId => {
                  delete newErrors[fieldId];
                });
                return newErrors;
              });
            };

            const handlePrevious = () => {
              setCurrentStep(currentStep - 1);
            };

            const handleStepSubmit = async (e) => {
              e.preventDefault();
              
              if (isMultiStep && currentStep < steps.length) {
                handleNext();
              } else {
                // Final submit
                const allValidationErrors = validateForm();
                if (allValidationErrors.length > 0) {
                  toast.error("Please correct all errors before submitting");
                  return;
                }
                
                setSubmitting(true);
                try {
                  const { responseService } = await import('@/services/api/responseService');
                  await responseService.create(form.Id, formData);
                  await formService.incrementSubmissionCount(form.Id);
                  
                  setSubmitted(true);
                  toast.success(form.settings?.successMessage || "Form submitted successfully!");
                } catch (err) {
                  console.error('Form submission error:', err);
                  toast.error("Failed to submit form. Please try again.");
                } finally {
                  setSubmitting(false);
                }
              }
            };

            return (
              <form onSubmit={handleStepSubmit} className="space-y-6">
                {isMultiStep && (
                  <>
                    {/* Progress Bar */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">
                          Step {currentStep} of {steps.length}
                        </span>
                        <span className="text-sm text-gray-500">
                          {Math.round((currentStep / steps.length) * 100)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                      </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="flex items-center space-x-4">
                        {steps.map((_, index) => {
                          const stepNumber = index + 1;
                          const isCompleted = completedSteps.has(stepNumber);
                          const isCurrent = stepNumber === currentStep;
                          const isPast = stepNumber < currentStep;
                          
                          return (
                            <div key={stepNumber} className="flex items-center">
                              <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                                  isCompleted || isPast
                                    ? 'bg-primary-500 text-white' 
                                    : isCurrent
                                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                                whileScale={isCurrent ? 1.1 : 1}
                              >
                                {isCompleted || isPast ? (
                                  <ApperIcon name="Check" size={16} />
                                ) : (
                                  stepNumber
                                )}
                              </motion.div>
                              {index < steps.length - 1 && (
                                <div className={`w-12 h-1 mx-2 rounded-full transition-colors ${
                                  isPast ? 'bg-primary-500' : 'bg-gray-200'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Current Step Fields */}
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
{getVisibleFields(steps[currentStep - 1] || [], formData).map(field => (
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
                </motion.div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  {isMultiStep ? (
                    <>
                      <Button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        variant="secondary"
                        className="inline-flex items-center gap-2"
                      >
                        <ApperIcon name="ChevronLeft" className="w-4 h-4" />
                        Previous
                      </Button>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2"
                      >
                        {currentStep === steps.length ? (
                          submitting ? (
                            <>
                              <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            form.settings?.submitButtonText || "Submit"
                          )
                        ) : (
                          <>
                            Next
                            <ApperIcon name="ChevronRight" className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
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
                  )}
                </div>
              </form>
            );
          })()}
        </motion.div>
      </div>
    </div>
  );
};

export default PublishedForm;