import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { formService } from '@/services/api/formService';

const ResponsesAnalytics = ({ form, submissionCount, onViewResponses }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await formService.getAnalytics(form.Id);
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [form.Id]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ApperIcon name="TrendingUp" className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ApperIcon name="TrendingDown" className="w-4 h-4 text-red-500" />;
      default:
        return <ApperIcon name="Minus" className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6">
          <div className="animate-spin w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Analytics Display */}
      <div className="text-center py-4">
        <ApperIcon name="BarChart3" className="w-12 h-12 mx-auto text-primary-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Form Analytics
        </h3>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Total Responses */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ApperIcon name="Users" className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Total Responses</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.totalResponses || 0}
            </div>
          </div>

          {/* This Week's Activity */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ApperIcon name="Calendar" className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">This Week</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-blue-900">
                {analytics?.thisWeekResponses || 0}
              </span>
              {analytics && getTrendIcon(analytics.trend)}
            </div>
            {analytics && (
              <div className={`text-xs mt-1 ${getTrendColor(analytics.trend)}`}>
                {analytics.trend === 'up' && `+${analytics.thisWeekResponses - analytics.lastWeekResponses} from last week`}
                {analytics.trend === 'down' && `${analytics.thisWeekResponses - analytics.lastWeekResponses} from last week`}
                {analytics.trend === 'stable' && 'No change from last week'}
              </div>
            )}
          </div>

          {/* Last Submission */}
          {analytics?.lastSubmissionDate && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ApperIcon name="Clock" className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Last Submission</span>
              </div>
              <div className="text-sm font-medium text-green-900">
                {format(new Date(analytics.lastSubmissionDate), 'MMM d, yyyy')}
              </div>
              <div className="text-xs text-green-700">
                {format(new Date(analytics.lastSubmissionDate), 'h:mm a')}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
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

        {submissionCount === 0 && (
          <p className="text-gray-500 text-sm">
            No responses yet. Share your form to start collecting data!
          </p>
        )}
      </div>
      
      {/* Form Actions */}
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
  );
};

export default ResponsesAnalytics;