import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { responseService } from "@/services/api/responseService";
import { formService } from "@/services/api/formService";
import ApperIcon from "@/components/ApperIcon";
import Dashboard from "@/components/pages/Dashboard";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";

export default function FormResponses() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fieldFilters, setFieldFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    loadData();
  }, [formId]);

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      const [formData, responsesData] = await Promise.all([
        formService.getById(parseInt(formId)),
        responseService.getByFormId(formId)
      ]);
      setForm(formData);
      setResponses(responsesData);
    } catch (err) {
      setError("Failed to load form responses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (responseId) => {
    if (window.confirm("Are you sure you want to delete this response?")) {
      try {
        await responseService.delete(responseId);
        setResponses(responses.filter(r => r.Id !== responseId));
        toast.success("Response deleted successfully");
      } catch (err) {
        toast.error("Failed to delete response");
      }
    }
  };

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
  };

  const handleCloseResponse = () => {
    setSelectedResponse(null);
};

// Filter responses based on search term, date range, and field filters
  const filteredResponses = useMemo(() => {
    return responseService.filterResponses(responses, {
      searchTerm,
      startDate,
      endDate,
      fieldFilters,
      form
    });
  }, [responses, searchTerm, startDate, endDate, fieldFilters, form]);

  // Get unique values for field filters
  const getFieldOptions = (fieldId) => {
    if (!form || !responses.length) return [];
    
    const field = form.fields.find(f => f.Id === fieldId);
    if (!field) return [];
    
    // For select/radio fields, use predefined options
    if ((field.type === 'select' || field.type === 'radio') && field.options) {
      return field.options;
    }
    
    // For other fields, get unique values from responses
    const values = new Set();
    responses.forEach(response => {
      const value = response.data[fieldId];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => values.add(v));
        } else {
          values.add(value);
        }
      }
    });
    
    return Array.from(values).sort();
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setFieldFilters({});
    toast.success("All filters cleared");
  };

  const handleFieldFilterChange = (fieldId, value) => {
    setFieldFilters(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleExportCSV = async () => {
    const responsesToExport = filteredResponses.length > 0 ? filteredResponses : responses;
    
    if (!form || responsesToExport.length === 0) {
      toast.error("No responses to export");
      return;
    }

    try {
      setExporting(true);
      const csvContent = responseService.exportToCSV(form, responsesToExport);
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${form.name}-responses.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      const filterText = filteredResponses.length !== responses.length ? ' (filtered)' : '';
      toast.success(`Exported ${responsesToExport.length} responses to CSV${filterText}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export responses");
    } finally {
      setExporting(false);
    }
  };
  const renderFieldValue = (field, value) => {
    if (field.type === 'checkbox') {
      return value ? 'Yes' : 'No';
    }
    if (field.type === 'select' && Array.isArray(value)) {
      return value.join(', ');
    }
    return value || 'No response';
  };

  if (loading) return <Loading type="page" />;
  if (error) return <Error message={error} onRetry={loadData} />;
  if (!form) return <Error message="Form not found" onRetry={() => navigate('/dashboard')} />;

return (
    <div className="p-4 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
      >
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-2">
            {form.name} - Responses
          </h1>
          <p className="text-gray-600">
            {filteredResponses.length} of {responses.length} response{responses.length !== 1 ? 's' : ''} 
            {filteredResponses.length !== responses.length && ' (filtered)'}
          </p>
        </div>
        {responses.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ApperIcon name="Filter" className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ApperIcon name="Download" className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export to CSV'}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Filters Panel */}
      {responses.length > 0 && showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 lg:mb-0">
                Filter Responses
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-800 self-start lg:self-auto"
              >
                <ApperIcon name="X" className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
              {/* Search Bar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search responses
                </label>
                <div className="relative">
                  <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search in all fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Field Filters */}
            {form.fields.filter(field => ['select', 'radio', 'checkbox'].includes(field.type)).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Filter by field values</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {form.fields
                    .filter(field => ['select', 'radio', 'checkbox'].includes(field.type))
                    .map(field => (
                      <div key={field.Id}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {field.label}
                        </label>
                        <select
                          value={fieldFilters[field.Id] || ''}
                          onChange={(e) => handleFieldFilterChange(field.Id, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">All values</option>
                          {getFieldOptions(field.Id).map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

{responses.length === 0 ? (
        <Empty
          title="No responses yet"
          description="This form hasn't received any submissions yet. Share your form link to start collecting responses."
          icon="Inbox"
        />
      ) : filteredResponses.length === 0 ? (
        <Empty
          title="No responses match your filters"
          description="Try adjusting your search criteria or clearing some filters to see more results."
          icon="Search"
          actionLabel="Clear Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  {form.fields.map(field => (
                    <th key={field.Id} className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </th>
                  ))}
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponses.map((response, index) => (
                  <motion.tr
                    key={response.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewResponse(response)}
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      #{response.Id}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {format(new Date(response.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    {form.fields.map(field => (
                      <td key={field.Id} className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">
                        {renderFieldValue(field, response.data[field.Id])}
                      </td>
                    ))}
                    <td className="py-4 px-6 text-sm">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewResponse(response)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ApperIcon name="Eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteResponse(response.Id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
{filteredResponses.map((response, index) => (
              <motion.div
                key={response.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleViewResponse(response)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Response #{response.Id}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(response.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewResponse(response)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ApperIcon name="Eye" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResponse(response.Id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {form.fields.slice(0, 2).map(field => (
                    <div key={field.Id} className="flex justify-between">
                      <span className="text-xs font-medium text-gray-500 truncate pr-2">
                        {field.label}:
                      </span>
                      <span className="text-xs text-gray-900 truncate max-w-[60%]">
                        {renderFieldValue(field, response.data[field.Id])}
                      </span>
                    </div>
                  ))}
                  {form.fields.length > 2 && (
                    <div className="text-xs text-gray-400 pt-1">
                      +{form.fields.length - 2} more field{form.fields.length - 2 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Response Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseResponse}
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {form.fields.map(field => (
                  <div key={field.Id}>
                    <dt className="text-sm font-medium text-gray-900 mb-2">{field.label}</dt>
                    <dd className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md">
                      {renderFieldValue(field, selectedResponse.data[field.Id])}
                    </dd>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500">
                  Submitted on {format(new Date(selectedResponse.submittedAt), 'PPPP')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
