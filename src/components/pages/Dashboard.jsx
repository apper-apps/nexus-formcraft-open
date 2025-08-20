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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
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
// Filter and sort forms based on search and filters
  const filteredAndSortedForms = React.useMemo(() => {
    let filtered = forms.filter(form => {
      // Search filter
      const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      let matchesStatus = true;
      if (statusFilter === "published") {
        matchesStatus = form.isPublished === true;
      } else if (statusFilter === "draft") {
        matchesStatus = form.isPublished === false;
      } else if (statusFilter === "recent") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        matchesStatus = new Date(form.updatedAt || form.createdAt) > oneWeekAgo;
      }
      
      return matchesSearch && matchesStatus;
    });

    // Sort forms
    filtered.sort((a, b) => {
      if (sortBy === "createdAt") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "updatedAt") {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      } else if (sortBy === "responses") {
        return (b.responseCount || 0) - (a.responseCount || 0);
      }
      return 0;
    });

    return filtered;
  }, [forms, searchQuery, statusFilter, sortBy]);

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

      {/* Search and Filter Section */}
      {forms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ApperIcon name="Search" className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search forms by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <ApperIcon name="X" className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Forms", icon: "LayoutGrid" },
                { key: "published", label: "Published", icon: "Eye" },
                { key: "draft", label: "Draft", icon: "Edit3" },
                { key: "recent", label: "Recently Updated", icon: "Clock" }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    statusFilter === key
                      ? "bg-primary-100 text-primary-700 border border-primary-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <ApperIcon name={icon} className="w-4 h-4 mr-1.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="createdAt">Creation Date</option>
                <option value="updatedAt">Last Updated</option>
                <option value="responses">Response Count</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

{forms.length === 0 ? (
        <Empty
          title="No forms created yet"
          description="Get started by creating your first form with our intuitive drag-and-drop builder or choose from our pre-built templates"
          actionLabel="Create Your First Form"
          onAction={handleCreateNew}
          icon="FormInput"
        />
      ) : filteredAndSortedForms.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ApperIcon name="Search" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Create your first form to get started"}
          </p>
          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredAndSortedForms.map((form, index) => (
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