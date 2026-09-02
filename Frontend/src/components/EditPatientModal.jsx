import { useEffect, useState, useCallback } from 'react';
import { X, User, Calendar, FileText, Loader2, AlertCircle, Edit3, Lock, Activity } from 'lucide-react';
import { updatePatient , MED_FIELDS } from '../services/patientServices';
import { useAuthStore } from '../store/authStore';
import { formatStringDate } from '../utils/format';

const parseMedicalInfo = (info) => {
  if (!info) return {};
  if (typeof info === 'string') {
    try {
      return JSON.parse(info);
    } catch {
      return {};
    }
  }
  return info;
};

const EditPatientModal = ({ patient, onClose, onSaved }) => {
  const { user, activeDoctorId } = useAuthStore();
  const isSecretary = user?.role === 'secrétaire';

  const [firstName, setFirstName] = useState(patient?.prenom_patient || '');
  const [lastName, setLastName] = useState(patient?.nom_patient || '');
  const [sexe, setSexe] = useState(patient?.sexe);
  const [dateNaissance, setDateNaissance] = useState(formatStringDate(patient?.date_naissance));

  const [medicalInfo, setMedicalInfo] = useState(() => parseMedicalInfo(patient?.informations_medicales));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleMedicalChange = (key) => (e) => {
    const value = e.target.value;
    setMedicalInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      return setError('Le nom et le prénom sont requis.');
    }

    setSaving(true);

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      sexe,
      date_naissance: dateNaissance || null,
    };

    if (isSecretary) {
      payload.ref_doctor_id = activeDoctorId || user?.ref_doctor_id;
    } else {
      payload.informations_medicales = medicalInfo;
    }

    const patientId = patient?.id_patient || patient?.id;
    const response = await updatePatient(patientId, payload);

    setSaving(false);

    if (response?.error) {
      setError(response.error);
    } else {
      onSaved();
      
    }
  };

  const inputStyle = (disabled = false) =>
    `w-full rounded-xl border px-3 py-2 text-sm transition-all ${
      disabled
        ? 'bg-gray/10 border-gray/20 text-gray/60 cursor-not-allowed'
        : 'border-gray/30 text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal bg-white'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray/10 animate-in fade-in zoom-in-95 duration-150 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray/15 bg-paper/50 shrink-0">
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-teal" />
            Modifier le dossier patient
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray hover:text-ink hover:bg-gray/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          <section className="space-y-4">
            <h4 className="text-gray text-xs font-bold uppercase tracking-wider border-b border-gray/10 pb-2">
              Informations Générales
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray text-xs font-semibold uppercase tracking-wider  mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray" />
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={inputStyle()}
                />
              </div>

              <div>
                <label className="text-gray text-xs font-semibold uppercase tracking-wider  mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray" />
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className={inputStyle()}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Sexe
                </label>
                <select
                  value={sexe}
                  onChange={(e) => setSexe(e.target.value)}
                  className={inputStyle()}
                >
                  <option value="M">Masculin (M)</option>
                  <option value="F">Féminin (F)</option>
                </select>
              </div>

              <div>
                <label className="text-gray text-xs font-semibold uppercase tracking-wider  mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray" />
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  className={inputStyle()}
                />
              </div>
            </div>
          </section>

          <section className="bg-paper/40 rounded-xl border border-gray/15 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray/10 pb-3">
              <h4 className="text-gray text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal" />
                Informations Médicales
              </h4>

              {isSecretary ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  <Lock className="w-3 h-3" /> Réservé au médecin
                </span>
              ) : (
                <span className="text-gray/70 text-xs italic">Modifiable</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MED_FIELDS?.filter((f) => !f.compact && !f.fullWidth).map((field) => (
                <div key={field.key}>
                  <label className="text-gray text-xs font-semibold block mb-1">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={medicalInfo[field.key] ?? ''}
                      onChange={handleMedicalChange(field.key)}
                      disabled={isSecretary}
                      className={inputStyle(isSecretary)}
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt || '— Sélectionner —'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={medicalInfo[field.key] ?? ''}
                      onChange={handleMedicalChange(field.key)}
                      disabled={isSecretary}
                      className={inputStyle(isSecretary)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {MED_FIELDS?.filter((f) => f.fullWidth).map((field) => (
                <div key={field.key}>
                  <label className="text-gray text-xs font-semibold block mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={medicalInfo[field.key] ?? ''}
                    onChange={handleMedicalChange(field.key)}
                    disabled={isSecretary}
                    placeholder="Ex: Pénicilline, Pollen (séparés par des virgules)"
                    className={inputStyle(isSecretary)}
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray/10">
              <span className=" text-xs font-semibold text-gray uppercase tracking-wider mb-3 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-teal" />
                Signes vitaux & mesures
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MED_FIELDS?.filter((f) => f.compact).map((field) => (
                  <div key={field.key}>
                    <label className="text-gray text-xs font-semibold block mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={medicalInfo[field.key] ?? ''}
                      onChange={handleMedicalChange(field.key)}
                      disabled={isSecretary}
                      className={`${inputStyle(isSecretary)} font-mono`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red/10 border border-red/20 text-red text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray/15 bg-paper/30 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray/30 text-ink text-xs font-semibold hover:bg-gray/10 transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal text-white text-xs font-semibold hover:bg-teal/90 disabled:opacity-50 transition-all shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Enregistrement…</span>
              </>
            ) : (
              <span>Enregistrer les modifications</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditPatientModal;