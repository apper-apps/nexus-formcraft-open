import Input from "@/components/atoms/Input";

const FormField = ({ label, name, value, onChange, type = "text", placeholder, required, error }) => {
  return (
    <div className="space-y-1">
      <Input
        label={label}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        error={error}
      />
    </div>
  );
};

export default FormField;