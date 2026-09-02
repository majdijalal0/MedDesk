import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { createPatient , MED_FIELDS } from '../services/patientServices';
import { getTodayString } from '../utils/format';
import FormField from '../components/Register Patient/FormField';
import SuccessCard from '../components/Register Patient/SuccessCard';

const inputStyle = (err) => `w-full rounded-lg border px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal ${err ? 'border-red' : 'border-gray/40 focus:border-teal'}`;




const buildMedicalJSON = (medState) => {
  const result = {};
  MED_FIELDS.forEach((field) => {
    const rawValue = medState[field.key] ?? '';
    const formattedValue = field.type === 'tags'
      ? String(rawValue).split(',').map((item) => item.trim()).filter(Boolean)
      : String(rawValue).trim();

    const hasValue = Array.isArray(formattedValue) ? formattedValue.length > 0 : formattedValue !== '';
    if (hasValue) {
      result[field.key] = formattedValue;
    }
  });
  return result;
};

const RegisterPatient = () => {
    const navigate = useNavigate();
  const { user, activeDoctorId, doctors } = useAuthStore();
  const isSecretary = user.role === 'secrétaire';
  const assignedDoctor = isSecretary ? doctors.find((d) => d.id_user === activeDoctorId) : null;
  const doctorFullName = assignedDoctor ? `${assignedDoctor.nom_user} ${assignedDoctor.prenom_user}` : '';

  const [form, setForm] = useState({ nom: '', prenom: '', date_naissance: '', sexe: '', telephone: '' });
  const [medicalInfo, setMedicalInfo] = useState({});                
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [created, setCreated] = useState(null);

  

  const handleInputChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleMedicalChange = (field) => (e) => {
    setMedicalInfo((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!form.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!form.date_naissance) {
      newErrors.date_naissance = 'La date de naissance est requise';
    } else if (form.date_naissance > getTodayString()) {
      newErrors.date_naissance = 'La date de naissance ne peut pas être dans le futur';
    }
    if (!form.sexe) newErrors.sexe = 'Veuillez sélectionner un sexe';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    if (!validate()) return;
    if (isSecretary && !activeDoctorId) return setServerError("Sélectionnez d'abord un médecin");
    setSaving(true);
    const payload = {
      last_name: form.nom.trim(),
      first_name: form.prenom.trim(),
      date_naissance: form.date_naissance,
      sexe: form.sexe,
      telephone: form.telephone.trim() || null,
      ...(isSecretary ? { ref_doctor_id: activeDoctorId } : { informations_medicales: buildMedicalJSON(medicalInfo) }),
    };
    const r = await createPatient(payload);
    setSaving(false);
    if (r.error) return setServerError(r.error);
    setCreated({ id: r.patient.id_patient, name: `${r.patient.nom_patient} ${r.patient.prenom_patient}` });
  };

  const reset = () => { setForm({ nom: '', prenom: '', date_naissance: '', sexe: '', telephone: '' }); setMedicalInfo({}); setErrors({}); setServerError(''); setCreated(null); };

  if (created) {
    return (
      <SuccessCard
        createdPatient={created}
        doctorName={doctorFullName}
        isSecretary={isSecretary}
        onReset={reset}
        onBack={() => navigate(-1)}
      />
    );
  }

  if (created) {
    return (
      <SuccessCard
        createdPatient={created}
        doctorName={doctorFullName}
        isSecretary={isSecretary}
        onReset={reset}
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="bg-paper min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className='mb-3'>
          <Link
            to={isSecretary ? '/dashboard' : '/dashboard/patients'}
            className="text-teal text-sm font-medium hover:underline inline-flex items-center gap-1.5"
          >
            ← Retour aux patients
          </Link>

          <div className="mt-3">
            <h1 className="font-display text-3xl text-ink font-semibold tracking-tight">Nouveau patient</h1>
            <p className="text-gray text-sm mt-1">
              {isSecretary ? (
                <>
                  Inscription au dossier du{' '}
                  <span className="text-ink font-medium">
                    {assignedDoctor ? `Dr ${doctorFullName}` : 'Médecin non sélectionné'}
                  </span>
                </>
              ) : (
                "Inscription d'un nouveau patient à votre dossier"
              )}
            </p>
          </div>
        </div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        

        <form onSubmit={submit} className="space-y-6">
          
          <section className="bg-white rounded-xl border border-gray/20 p-6 space-y-5 shadow-xs">
            <h2 className="text-gray text-xs font-bold uppercase tracking-wider border-b border-gray/10 pb-3">
              Identité du patient
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Nom *" error={errors.nom}>
                <input
                  type="text"
                  value={form.nom}
                  onChange={handleInputChange('nom')}
                  className={inputStyle(errors.nom)}
                  placeholder="ex. Benali"
                />
              </FormField>

              <FormField label="Prénom *" error={errors.prenom}>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={handleInputChange('prenom')}
                  className={inputStyle(errors.prenom)}
                  placeholder="ex. Amina"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Date de naissance *" error={errors.date_naissance}>
                <input
                  type="date"
                  max={getTodayString()}
                  value={form.date_naissance}
                  onChange={handleInputChange('date_naissance')}
                  className={inputStyle(errors.date_naissance)}
                />
              </FormField>

              <FormField label="Téléphone (optionnel)">
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={handleInputChange('telephone')}
                  placeholder="06 12 34 56 78"
                  className={inputStyle()}
                />
              </FormField>
            </div>

            <div>
              <span className="block text-gray text-xs font-semibold uppercase tracking-wider mb-2">
                Sexe *
              </span>
              <div className="flex gap-3">
                {[
                  ['M', 'Homme'],
                  ['F', 'Femme'],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setForm((prev) => ({ ...prev, sexe: value }))}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      form.sexe === value
                        ? 'border-teal bg-teal/10 text-teal shadow-xs'
                        : 'border-gray/30 text-gray hover:text-ink hover:border-gray/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.sexe && <p className="text-red text-xs mt-1.5">{errors.sexe}</p>}
            </div>
          </section>

          {!isSecretary && (
            <section className="bg-white rounded-xl border border-gray/20 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray/10 pb-3">
                <h2 className="text-gray text-xs font-bold uppercase tracking-wider">
                  Informations médicales
                </h2>
                <span className="text-gray/70 text-xs italic">Optionnel</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {MED_FIELDS.filter(f => !f.compact && !f.fullWidth).map((field) => (
                  <FormField key={field.key} label={field.label}>
                    {field.type === 'select' ? (
                      <select
                        value={medicalInfo[field.key] ?? ''}
                        onChange={handleMedicalChange(field.key)}
                        className={inputStyle()}
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
                        className={inputStyle()}
                      />
                    )}
                  </FormField>
                ))}
              </div>

              <div className="space-y-4">
                {MED_FIELDS.filter(f => f.fullWidth).map((field) => (
                  <FormField key={field.key} label={field.label}>
                    <input
                      type="text"
                      value={medicalInfo[field.key] ?? ''}
                      onChange={handleMedicalChange(field.key)}
                      placeholder="Ex: Pénicilline, Pollen (séparés par des virgules)"
                      className={inputStyle()}
                    />
                  </FormField>
                ))}
              </div>

             <div className="pt-2 border-t border-gray/10">
                <span className="block text-xs font-semibold text-gray uppercase tracking-wider mb-3">
                  Signes vitaux & mesures
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {MED_FIELDS.filter(f => f.compact).map((field) => (
                    <FormField key={field.key} label={field.label}>
                      <input
                        type="text"
                        value={medicalInfo[field.key] ?? ''}
                        onChange={handleMedicalChange(field.key)}
                        className={`${inputStyle()} font-mono`}
                      />
                    </FormField>
                  ))}
                </div>
              </div>

              <p className="text-gray/70 text-xs italic pt-1">
                Vous pourrez ajouter ou modifier ces informations ultérieurement depuis la fiche du patient.
              </p>
            </section>
          )}

          {serverError && (
            <div className="p-4 bg-red/10 border border-red/20 rounded-xl text-red text-sm font-medium flex items-center gap-2">
               {serverError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg border border-gray/30 text-ink text-sm font-medium hover:bg-gray/5 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 disabled:opacity-50 transition-colors shadow-xs"
            >
              {saving ? 'Enregistrement…' : 'Inscrire le patient'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
export default RegisterPatient;