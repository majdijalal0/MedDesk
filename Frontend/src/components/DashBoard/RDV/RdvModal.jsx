import { useEffect, useState, useMemo, useCallback } from 'react';
import { X, User, Calendar, Tag, Search, Loader2, AlertCircle, Check } from 'lucide-react';
import { createRdv, RDV_TYPES } from '../../../services/rdvServices';
import { getPatients } from '../../../services/patientServices';
import { useAuthStore } from '../../../store/authStore';
import {getInitialDateTime} from '../../../utils/format'


const BookingModal = ({ patientId, patientName, onClose, onSaved }) => {
  const isFixedPatient = Boolean(patientId);

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pickedId, setPickedId] = useState(null);
  const [pickedName, setPickedName] = useState('');
  const [dateTime, setDateTime] = useState(getInitialDateTime);
  const [type, setType] = useState(RDV_TYPES?.[0] || 'Consultation');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { activeDoctorId } = useAuthStore();

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    if (!isFixedPatient) {
      getPatients(activeDoctorId).then((res) => {
        setPatients(res?.patients || []);
      });
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, isFixedPatient, activeDoctorId]);

  const matchingPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) =>
      `${p.nom_patient} ${p.prenom_patient}`.toLowerCase().includes(q)
    );
  }, [searchQuery, patients]);

  const effectiveId = isFixedPatient ? patientId : pickedId;

  const handleSave = async () => {
    if (!effectiveId) {
      setErrorMessage('Veuillez sélectionner un patient');
      return;
    }
    if (!dateTime) {
      setErrorMessage('Veuillez choisir une date et une heure');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const formattedIsoDate = new Date(dateTime).toISOString();
      const res = await createRdv(effectiveId, formattedIsoDate, type,activeDoctorId);

      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        onSaved?.();
        onClose();
      }
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
            <Calendar className="w-5 h-5 text-teal" />
            Nouveau rendez-vous
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

            {isFixedPatient ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-teal/5 border border-teal/20 text-ink text-sm font-medium">
                <User className="w-4 h-4 text-teal" />
                <span>{patientName}</span>
              </div>
            ) : pickedName ? (
              <div className="flex items-center justify-between rounded-xl border border-teal/30 bg-teal/5 px-3 py-2.5">
                <span className="text-ink text-sm font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal" />
                  {pickedName}
                </span>
                <button
                  onClick={() => {
                    setPickedId(null);
                    setPickedName('');
                  }}
                  className="text-teal text-xs font-semibold hover:underline"
                >
                  Changer
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom ou prénom..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray/30 text-sm text-ink placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
                  />
                </div>

                {searchQuery.trim().length > 0 && (
                  <ul className="absolute left-0 right-0 mt-1 max-h-44 overflow-y-auto bg-white border border-gray/20 rounded-xl shadow-lg z-10 divide-y divide-gray/10">
                    {matchingPatients.length === 0 ? (
                      <li className="px-4 py-3 text-gray text-xs italic">
                        Aucun patient trouvé
                      </li>
                    ) : (
                      matchingPatients.map((p) => (
                        <li key={p.id_patient}>
                          <button
                            type="button"
                            onClick={() => {
                              setPickedId(p.id_patient);
                              setPickedName(`${p.nom_patient} ${p.prenom_patient}`);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-teal/5 transition-colors flex items-center justify-between"
                          >
                            <span className="font-medium">
                              {p.nom_patient} {p.prenom_patient}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-gray text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Date et heure
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full rounded-xl border border-gray/30 px-3.5 py-2.5 text-sm text-ink font-mono focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
              />
            </div>
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
              {RDV_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
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

export default BookingModal;