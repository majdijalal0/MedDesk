import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ErrorPage = ({ error }) => {
  const navigate = useNavigate();

  const getMessage = (err) => {
    if (typeof err === 'string') return err;
    if (!err) return "Une erreur est survenue";
    
    const payload = err.error ?? err;
    
    if (typeof payload === 'string') return payload;
    if (payload?.error && typeof payload.error === 'string') return payload.error;
    if (payload?.message && typeof payload.message === 'string') return payload.message;
    
    return "Une erreur est survenue";
  };

  const errorMessage = getMessage(error);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray/15 p-6 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="w-12 h-12 rounded-full bg-red/10 text-red flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-lg font-bold text-ink">
            Une erreur est survenue
          </h3>
          <p className="text-sm text-gray bg-paper p-3 rounded-xl border border-gray/10">
            {errorMessage}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ErrorPage;