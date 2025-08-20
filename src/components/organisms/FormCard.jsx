import { motion } from "framer-motion";
import { format } from "date-fns";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from "@/components/atoms/Card";

const FormCard = ({ form, onEdit, onDelete, onDuplicate, onViewResponses }) => {
  const navigate = useNavigate();
  const isPublished = form.isPublished;
  const fieldCount = form.fields?.length || 0;
  const submissionCount = form.submissionCount || 0;
  const [activeTab, setActiveTab] = React.useState('overview');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 hover:border-primary-200 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {form.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <ApperIcon name="Calendar" className="w-4 h-4" />
                {format(new Date(form.createdAt), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ApperIcon name="FormInput" className="w-4 h-4" />
                  {fieldCount} field{fieldCount !== 1 ? "s" : ""}
                </div>
                {form.isPublished && (
                  <div className="flex items-center gap-1">
                    <ApperIcon name="Send" className="w-4 h-4 text-success" />
                    {submissionCount} response{submissionCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <ApperIcon name="FileText" className="w-6 h-6 text-primary-600" />
          </div>
        </div>

        {fieldCount > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Fields:</p>
            <div className="flex flex-wrap gap-1">
              {form.fields.slice(0, 3).map((field, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-md"
                >
                  {field.label}
                </span>
              ))}
              {fieldCount > 3 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded-md">
                  +{fieldCount - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-100 pt-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          {form.isPublished && (
            <button
              onClick={() => setActiveTab('responses')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'responses'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Responses ({submissionCount})
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          {activeTab === 'overview' && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(form)}
                className="flex-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
              >
                <ApperIcon name="Edit3" className="w-4 h-4 mr-2" />
                Edit
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(form)}
                className="flex-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              >
                <ApperIcon name="Copy" className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(form.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ApperIcon name="Trash2" className="w-4 h-4" />
              </Button>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <ApperIcon name="BarChart3" className="w-12 h-12 mx-auto text-primary-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {submissionCount} Response{submissionCount !== 1 ? 's' : ''}
                </h3>
                <p className="text-gray-500 mb-4">
                  View and manage form submissions
                </p>
                {submissionCount > 0 && (
                  <Button
                    size="sm"
                    onClick={() => onViewResponses(form)}
                    className="mb-2"
                  >
                    <ApperIcon name="Eye" className="w-4 h-4 mr-2" />
                    View All Responses
                  </Button>
                )}
              </div>
              
              {form.isPublished && (
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/form/${form.publishId}`, '_blank')}
                    className="flex-1 text-success hover:text-success-dark hover:bg-success-light"
                  >
                    <ApperIcon name="ExternalLink" className="w-4 h-4 mr-2" />
                    View Form
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/form/${form.publishId}`);
                      toast.success('Form link copied to clipboard!');
                    }}
                    className="flex-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  >
                    <ApperIcon name="Copy" className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          )}

          {form.isPublished && activeTab === 'overview' && (
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/form/${form.publishId}`, '_blank')}
                className="flex-1 text-success hover:text-success-dark hover:bg-success-light"
              >
                <ApperIcon name="ExternalLink" className="w-4 h-4 mr-2" />
                View Form
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/form/${form.publishId}`);
                  toast.success('Form link copied to clipboard!');
                }}
                className="flex-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
              >
                <ApperIcon name="Copy" className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default FormCard;