import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const PublishFormModal = ({ isOpen, onClose, form, onUnpublish }) => {
  const [copying, setCopying] = useState(false);

  if (!isOpen || !form) return null;

  const copyToClipboard = async () => {
    if (!form.publishUrl) return;
    
    setCopying(true);
    try {
      await navigator.clipboard.writeText(form.publishUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = form.publishUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Link copied to clipboard!");
      } catch (fallbackErr) {
        toast.error("Failed to copy link");
      }
      document.body.removeChild(textArea);
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const handleUnpublish = async () => {
    await onUnpublish();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-bold text-gray-900">
              Form Published Successfully!
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="Globe" className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{form.name}</p>
                <p className="text-sm text-gray-500">is now publicly available</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shareable Link:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.publishUrl || ''}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  onClick={copyToClipboard}
                  disabled={copying}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1 px-3 py-2"
                >
                  <ApperIcon 
                    name={copying ? "Check" : "Copy"} 
                    className={`w-4 h-4 ${copying ? "text-success" : ""}`} 
                  />
                  {copying ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <ApperIcon name="Info" className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Share this form</p>
                  <p>Anyone with this link can view and submit your form. You can unpublish it at any time.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={copyToClipboard}
              className="flex-1 inline-flex items-center justify-center gap-2"
              disabled={copying}
            >
              <ApperIcon name="Share2" className="w-4 h-4" />
              Share Link
            </Button>
            <Button
              onClick={handleUnpublish}
              variant="secondary"
              className="inline-flex items-center gap-2"
            >
              <ApperIcon name="EyeOff" className="w-4 h-4" />
              Unpublish
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublishFormModal;