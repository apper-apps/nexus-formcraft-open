import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const FormPreview = ({ fields, formName }) => {
  const renderField = (field) => {
    const commonProps = {
      key: field.Id,
      name: `field_${field.Id}`,
      placeholder: field.placeholder,
      required: field.required
    };

    switch (field.type) {
      case "text":
        return (
          <div className="field-wrapper">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...commonProps}
            />
          </div>
        );

      case "email":
        return (
          <div className="field-wrapper">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...commonProps}
            />
          </div>
        );

      case "textarea":
        return (
          <div className="field-wrapper">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              {...commonProps}
            />
          </div>
        );

      case "select":
        return (
          <div className="field-wrapper">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...commonProps}
            >
              <option value="">{field.placeholder || "Select an option"}</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "checkbox":
        return (
          <div className="field-wrapper">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...commonProps}
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-6">
        <ApperIcon name="Eye" className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-display font-bold text-gray-900">
          Live Preview
        </h3>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ApperIcon name="FileText" className="w-12 h-12 mx-auto mb-4" />
          <p className="text-sm">Preview will appear here</p>
        </div>
      ) : (
        <motion.div
          className="form-preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
            {formName || "Untitled Form"}
          </h2>
          
          <form className="space-y-4">
            {fields.map(renderField)}
            
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all duration-200"
                disabled
              >
                Submit Form
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default FormPreview;