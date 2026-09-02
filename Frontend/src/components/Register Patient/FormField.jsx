
const FormField = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="block text-gray text-xs font-medium uppercase tracking-wider">
      {label}
    </label>
    {children}
    {error && <p className="text-red text-xs mt-1">{error}</p>}
  </div>
);

export default FormField