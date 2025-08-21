import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
const generateEmbedCode = () => {
    if (!form?.publishId) return '';
    
    const embedUrl = `${window.location.origin}/form/${form.publishId}`;
    const size = embedSizes[embedSize];
    
    return `<iframe src="${embedUrl}" width="${size.width}" height="${size.height}" frameborder="0" style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
  };
const PublishFormModal = ({ isOpen, onClose, form, onUnpublish }) => {
  const [copying, setCopying] = useState(false);
  const [activeTab, setActiveTab] = useState('share');
  const [embedSize, setEmbedSize] = useState('medium');
  const [copyingEmbed, setCopyingEmbed] = useState(false);

  if (!isOpen || !form) return null;

  const embedSizes = {
    small: { width: 400, height: 300, label: 'Small (400×300)' },
    medium: { width: 600, height: 450, label: 'Medium (600×450)' },
    large: { width: 800, height: 600, label: 'Large (800×600)' }
  };

const generateEmbedCode = () => {
    const size = embedSizes[embedSize];
    return `<iframe src="${form.publishUrl}" width="${size.width}" height="${size.height}" frameborder="0" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);"></iframe>`;
  };

  const copyToClipboard = async (text, type = 'link') => {
    const setCopyingState = type === 'embed' ? setCopyingEmbed : setCopying;
    
    setCopyingState(true);
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type === 'embed' ? 'Embed code' : 'Link'} copied to clipboard!`);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success(`${type === 'embed' ? 'Embed code' : 'Link'} copied to clipboard!`);
      } catch (fallbackErr) {
        toast.error(`Failed to copy ${type === 'embed' ? 'embed code' : 'link'}`);
      }
      document.body.removeChild(textArea);
    } finally {
      setTimeout(() => setCopyingState(false), 1000);
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="Globe" className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{form.name}</p>
                <p className="text-sm text-gray-500">is now publicly available</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('share')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'share'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ApperIcon name="Share2" className="w-4 h-4" />
                  Share
                </div>
              </button>
              <button
                onClick={() => setActiveTab('embed')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'embed'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ApperIcon name="Code" className="w-4 h-4" />
                  Embed
                </div>
              </button>
            </div>

            {/* Share Tab Content */}
            {activeTab === 'share' && (
              <div>
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
                      onClick={() => copyToClipboard(form.publishUrl || '', 'link')}
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

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ApperIcon name="Info" className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Share this form</p>
                      <p>Anyone with this link can view and submit your form. You can unpublish it at any time.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

{/* Embed Tab Content */}
            {activeTab === 'embed' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Embed Size:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(embedSizes).map(([key, size]) => (
                      <button
                        key={key}
                        onClick={() => setEmbedSize(key)}
                        className={`p-3 text-sm rounded-lg border-2 transition-all ${
                          embedSize === key
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Embed Code:
                  </label>
                  <div className="space-y-2">
                    <textarea
                      value={generateEmbedCode()}
                      readOnly
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <Button
                      onClick={() => copyToClipboard(generateEmbedCode(), 'embed')}
                      disabled={copyingEmbed}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ApperIcon 
                        name={copyingEmbed ? "Check" : "Copy"} 
                        className={`w-4 h-4 ${copyingEmbed ? "text-success" : ""}`} 
                      />
                      {copyingEmbed ? "Code Copied!" : "Copy Embed Code"}
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preview:
                  </label>
                  <div className="flex justify-center">
                    <div 
                      className="bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                      style={{
                        width: `${Math.min(embedSizes[embedSize].width * 0.5, 300)}px`,
                        height: `${Math.min(embedSizes[embedSize].height * 0.5, 200)}px`
                      }}
                    >
                      <div className="text-center text-gray-500">
                        <ApperIcon name="Monitor" className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Form Preview</p>
                        <p className="text-xs">{embedSizes[embedSize].width} × {embedSizes[embedSize].height}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <ApperIcon name="Info" className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Deployment Required</p>
                      <p>For embed codes to work, your form application must be deployed and accessible at the same domain as the embed URL. The form will not work in embeds until deployed.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ApperIcon name="AlertCircle" className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Embed Instructions</p>
                      <p>Copy the embed code above and paste it into your website's HTML where you want the form to appear. The form will be responsive within the specified dimensions.</p>
                    </div>
                  </div>
                </div>
              </div>
)}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => copyToClipboard(form.publishUrl || '', 'link')}
              className="flex-1 inline-flex items-center justify-center gap-2"
              disabled={copying}
            >
              <ApperIcon name="Share2" className="w-4 h-4" />
              {copying ? "Copied!" : "Share Link"}
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