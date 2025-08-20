import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { responseService } from "@/services/api/responseService";
import { formService } from "@/services/api/formService";

const FormResponses = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedResponse, setSelectedResponse] = useState(null);

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
            {responses.length} response{responses.length !== 1 ? 's' : ''} collected
          </p>
        </div>
      </motion.div>

      {responses.length === 0 ? (
        <Empty
          title="No responses yet"
          description="This form hasn't received any submissions yet. Share your form link to start collecting responses."
          icon="Inbox"
        />
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {responses.map((response, index) => (
            <motion.div
              key={response.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Response #{response.Id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted {format(new Date(response.submittedAt), 'PPp')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewResponse(response)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ApperIcon name="Eye" className="w-4 h-4 mr-2" />
                      View
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.fields.slice(0, 3).map(field => (
                    <div key={field.Id}>
                      <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {renderFieldValue(field, response.data[field.Id])}
                      </dd>
                    </div>
                  ))}
                  {form.fields.length > 3 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        +{form.fields.length - 3} more field{form.fields.length - 3 !== 1 ? 's' : ''}
                      </dt>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
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

export default FormResponses;