import { User, Mail, Lock, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createUser } from '../../services/adminServices';

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [role, setRole] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  if (!isOpen) return null;

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmation('');
    setRole('');
    setError('');
    setValidationErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setError('');

    let newErrors = {};

    if (!first_name || !last_name || !email || !password || !confirmation || !role) {
      newErrors.missingFields = "Vous avez des champs manquants";
    }

    if (password !== confirmation) {
      newErrors.confirmPassword = "Les mots de passe sont différents";
    }

    if (password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {

      const payload = {first_name,last_name,email,password,role}
      const response = await createUser(payload);

      if (response?.user) {
        onUserCreated(response.user);
        handleClose();
      }
    } catch (err) {
      const serverError = err.response?.data;
      if (serverError?.error) {
        setError(serverError.error);
      } else if (serverError?.errors && Array.isArray(serverError.errors)) {
        const fieldErrors = {};
        serverError.errors.forEach((errItem) => {
          fieldErrors[errItem.path] = errItem.msg;
        });
        setValidationErrors(fieldErrors);
      } else {
        setError("Erreur lors de la création du compte.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-800">Ajouter un utilisateur</h2>
          <button
            onClick={handleClose}
            type="button"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submitForm} className="mt-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex flex-col w-full md:w-1/2">
              <label className="text-sm font-semibold text-gray-700 mb-1">PRÉNOM</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Prénom"
                  value={first_name}
                  className="border border-gray-300 rounded-lg w-full h-11 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full md:w-1/2">
              <label className="text-sm font-semibold text-gray-700 mb-1">NOM</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nom"
                  value={last_name}
                  className="border border-gray-300 rounded-lg w-full h-11 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              {validationErrors.first_name && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-1">EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                className="border border-gray-300 rounded-lg w-full h-11 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex flex-col w-full md:w-1/2">
              <label className="text-sm font-semibold text-gray-700 mb-1">MOT DE PASSE</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  className="border border-gray-300 rounded-lg w-full h-11 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            <div className="flex flex-col w-full md:w-1/2">
              <label className="text-sm font-semibold text-gray-700 mb-1">CONFIRMER</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmation}
                  className="border border-gray-300 rounded-lg w-full h-11 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <label className="text-sm font-semibold text-gray-700 mb-2">RÔLE</label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="médecin"
                  checked={role === 'médecin'}
                  className="w-4 h-4 text-teal-700 bg-gray-100 border-gray-300 focus:ring-teal-500 accent-teal-700"
                  onChange={(e) => setRole(e.target.value)}
                />
                <span className="ml-2 text-sm text-gray-700">Médecin</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="secrétaire"
                  checked={role === 'secrétaire'}
                  className="w-4 h-4 text-teal-700 bg-gray-100 border-gray-300 focus:ring-teal-500 accent-teal-700"
                  onChange={(e) => setRole(e.target.value)}
                />
                <span className="ml-2 text-sm text-gray-700">Secrétaire</span>
              </label>
            </div>
            {validationErrors.role && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.role}</p>
            )}
          </div>

          {validationErrors.missingFields && (
            <p className="text-red-500 text-sm mb-3 text-center font-medium">
              {validationErrors.missingFields}
            </p>
          )}
          {error && (
            <p className="text-red-500 text-sm mb-3 text-center font-medium">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center px-5 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Créer l'utilisateur"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;