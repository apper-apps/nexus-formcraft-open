import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { templateService } from "@/services/api/templateService";
import { formService } from "@/services/api/formService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";

function FormTemplatesModal({ isOpen, onClose, onStartBlank }) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const categories = [
    { id: "all", name: "All Templates", icon: "Layout" },
    { id: "contact", name: "Contact Forms", icon: "Mail" },
    { id: "survey", name: "Surveys", icon: "BarChart3" },
    { id: "registration", name: "Registration", icon: "UserPlus" },
    { id: "feedback", name: "Feedback", icon: "MessageSquare" },
    { id: "application", name: "Applications", icon: "FileText" }
  ];

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getAll();
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = async (template) => {
    try {
      const newForm = {
        name: template.name,
        description: template.description,
        fields: template.fields,
        settings: template.settings || {
          submitButtonText: "Submit",
          successMessage: "Thank you for your submission!",
          allowMultipleSubmissions: true
        }
      };

      const savedForm = await formService.create(newForm);
      toast.success(`Form created from "${template.name}" template`);
      onClose();
      navigate(`/builder/${savedForm.Id}`);
    } catch (error) {
      console.error("Error creating form from template:", error);
      toast.error("Failed to create form from template");
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPreviewTemplate(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-display">Form Templates</h2>
              <p className="text-gray-600 mt-1">Choose from pre-built templates to get started quickly</p>
</div>
<div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStartBlank?.()}
                className="px-4"
              >
                Start Blank
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-2"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  icon="Search"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <ApperIcon name={category.icon} size={16} />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ height: 'calc(90vh - 200px)' }}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading templates...</p>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ApperIcon name="Search" size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No templates found</p>
                  <p className="text-gray-500">Try adjusting your search or category filter</p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <motion.div
                      key={template.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200">
                        {/* Template Header */}
                        <div className="p-4 flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                <ApperIcon name={template.icon} size={16} className="text-primary-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                <span className="text-xs text-gray-500 capitalize">{template.category}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(template)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ApperIcon name="Eye" size={16} />
                            </Button>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                              <ApperIcon name="List" size={12} />
                              {template.fields.length} fields
                            </span>
                            <span className="flex items-center gap-1">
                              <ApperIcon name="Clock" size={12} />
                              ~{template.estimatedTime} min
                            </span>
                          </div>
                        </div>

                        {/* Template Actions */}
                        <div className="p-4 pt-0">
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleUseTemplate(template)}
                              className="flex-1"
                            >
                              Use Template
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handlePreview(template)}
                            >
                              <ApperIcon name="Eye" size={16} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Template Preview Modal */}
        <AnimatePresence>
          {previewTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60"
              onClick={closePreview}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h3>
                    <p className="text-gray-600">{previewTemplate.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUseTemplate(previewTemplate)}
                    >
                      Use Template
                    </Button>
                    <Button variant="ghost" size="sm" onClick={closePreview}>
                      <ApperIcon name="X" size={20} />
                    </Button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                  <div className="form-preview">
                    <form className="space-y-4">
                      {previewTemplate.fields.map((field, index) => (
                        <div key={index} className="field-wrapper">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.type === 'text' && (
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                          )}
                          {field.type === 'email' && (
                            <input
                              type="email"
                              placeholder={field.placeholder}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                          )}
                          {field.type === 'textarea' && (
                            <textarea
                              placeholder={field.placeholder}
                              disabled
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                          )}
                          {field.type === 'select' && (
                            <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                              <option>{field.placeholder || 'Select an option'}</option>
                              {field.options?.map((option, i) => (
                                <option key={i}>{option}</option>
                              ))}
                            </select>
                          )}
                          {field.type === 'radio' && (
                            <div className="space-y-2">
                              {field.options?.map((option, i) => (
                                <label key={i} className="flex items-center">
                                  <input type="radio" name={`field-${index}`} disabled className="mr-2" />
                                  <span className="text-sm text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {field.type === 'checkbox' && (
                            <div className="space-y-2">
                              {field.options?.map((option, i) => (
                                <label key={i} className="flex items-center">
                                  <input type="checkbox" disabled className="mr-2" />
                                  <span className="text-sm text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="pt-4">
                        <Button variant="primary" disabled>
                          {previewTemplate.settings?.submitButtonText || "Submit"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}

export default FormTemplatesModal;