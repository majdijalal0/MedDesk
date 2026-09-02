import { useEffect, useState, useCallback } from 'react';
import { X, User, Calendar, Tag, Loader2, AlertCircle, Edit3, Activity } from 'lucide-react';
import { RDV_TYPES, RDV_STATUS } from '../../../services/rdvServices';
import { useAuthStore } from '../../../store/authStore';
import {toLocalInputValue} from '../../../utils/format'


const EditRdvModal = ({ rdv, onClose, onSaved }) => {
  const [dateTime, setDateTime] = useState(() => toLocalInputValue(rdv?.date_rdv));
  const [type, setType] = useState(rdv?.type || RDV_TYPES?.[0] || 'Consultation');
  const [statut, setStatut] = useState(rdv?.statut || 'Planifié');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {activeDoctorId} = useAuthStore();

  const patientName = `${rdv?.nom_patient || ''} ${rdv?.prenom_patient || ''}`.trim() || 'Patient inconnu';

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSave = async () => {
    if (!dateTime) {
      setErrorMessage('Veuillez choisir une date et une heure');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const formattedIsoDate = new Date(dateTime).toISOString();
      await onSaved(rdv, {
        date_rdv: formattedIsoDate,
        type,
        statut,
        activeDoctorId
      });
    } catch (err) {
      setErrorMessage(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray/10 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray/15 bg-paper/50">
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-teal" />
            Modifier le rendez-vous
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray hover:text-ink hover:bg-gray/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          
          <div>
            <label className="text-gray text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Patient
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-teal/5 border border-teal/20 text-ink text-sm font-medium">
              <User className="w-4 h-4 text-teal" />
              <span>{patientName}</span>
            </div>
          </div>

          <div>
            <label className="text-gray text-xs font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray" />
              Date et heure
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full rounded-xl border border-gray/30 px-3.5 py-2.5 text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
            />
          </div>

          <div>
            <label className="text-gray text-xs font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-gray" />
              Type de consultation
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-gray/30 px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
            >
              {RDV_TYPES?.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray text-xs font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-gray" />
              Statut
            </label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="w-full rounded-xl border border-gray/30 px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
            >
              {RDV_STATUS && Object.keys(RDV_STATUS).length > 0 ? (
                Object.keys(RDV_STATUS).map((statusKey) => (
                  <option key={statusKey} value={statusKey}>
                    {RDV_STATUS[statusKey].label || statusKey}
                  </option>
                ))
              ) : (
                <>
                  <option value="Planifié">Planifié</option>
                  <option value="En attente">En attente</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                  <option value="Annulé">Annulé</option>
                  <option value="Absent">Absent</option>
                </>
              )}
            </select>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red/10 border border-red/20 text-red text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray/15 bg-paper/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray/30 text-ink text-xs font-semibold hover:bg-gray/10 transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal text-white text-xs font-semibold hover:bg-teal/90 disabled:opacity-50 transition-all shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Enregistrement…</span>
              </>
            ) : (
              <span>Enregistrer</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditRdvModal;