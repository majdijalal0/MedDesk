import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import { SEXE_LABEL, computeAge } from '../../../utils/format';
import { deletePatient } from '../../../services/patientServices';
import EditPatientModal from '../../EditPatientModal';

const TABS = [
  { id: 'profil',  label: 'Profil' },
  { id: 'dossier', label: 'Dossier' },
  { id: 'rdv',     label: 'Rendez-vous' },
];

const Header = ({ patient, activeTab, setActiveTab, formatDate, onPatientUpdated }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const agePatient  = computeAge(patient?.date_naissance);
  const patientSexe = SEXE_LABEL[patient?.sexe] ?? patient?.sexe ?? '—';
  const dobLabel    = formatDate(patient?.date_naissance);

  const handleDelete = async () => {
    const patientName = `${patient?.nom_patient || ''} ${patient?.prenom_patient || ''}`.trim() || 'ce patient';
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement le dossier de ${patientName} ? Cette action est irréversible.`
    );

    if (!confirmed) return;

    setDeleting(true);
    const patientId = patient?.id_patient;
    const response = await deletePatient(patientId);
    setDeleting(false);

    if (response?.error) {
      alert(`Erreur: ${response.error}`);
    } else {
      navigate('/dashboard/patients');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <Link 
          to="/dashboard/patients" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            {patient?.nom_patient} {patient?.prenom_patient}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs sm:text-sm text-gray">
            <span>ID <strong className="data-value text-ink font-medium">{patient?.id_patient}</strong></span>
            <span>·</span>
            <span className="data-value text-ink font-medium">{agePatient !== null ? `${agePatient} ans` : '—'}</span>
            <span>·</span>
            <span className="text-ink font-medium">{patientSexe}</span>
            <span>·</span>
            <span>Né(e) le <strong className="data-value text-ink font-medium">{dobLabel ?? '—'}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start shrink-0">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray/30 text-ink text-xs font-semibold hover:bg-paper transition-all shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-teal" />
            <span>Modifier</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red/20 text-red bg-red/5 text-xs font-semibold hover:bg-red/10 transition-all shadow-2xs disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? 'Suppression…' : 'Supprimer'}</span>
          </button>
        </div>
      </div>

      
      <div className="flex gap-6 border-b border-gray/20 pt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-2.5 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === t.id
                ? 'text-teal'
                : 'text-gray hover:text-ink'
            }`}
          >
            {t.label}
            {activeTab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-full animate-in fade-in duration-150" />
            )}
          </button>
        ))}
      </div>

      {isEditing && (
        <EditPatientModal
          patient={patient}
          onClose={() => setIsEditing(false)}
          onSaved={() => {
            onPatientUpdated();
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
};

export default Header;