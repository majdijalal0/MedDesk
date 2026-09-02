import { AlertTriangle, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { summarizeHistory } from "../../../services/patientServices";
import { formatDate } from "../../../utils/format";

const KEY_METRICS = [
  { key: 'groupe_sanguin',  label: 'Groupe sanguin' },
  { key: 'allergies',       label: 'Allergies',        danger: true },
  { key: 'ta',              label: 'Tension (TA)',     mono: true },
  { key: 'pouls',           label: 'Pouls',           mono: true },
  { key: 'derniere_visite', label: 'Dernière visite',  mono: true },
  { key: 'imc',             label: 'IMC',            mono: true },
];

const resolveSlot = (patientInfo, slot) => {
  return patientInfo[slot.key]};

const SUMMARY_KEYS = ['antecedents', 'medicaments', 'pathologies_chroniques'];

const claimedJsonbKeys = new Set([
  ...KEY_METRICS.map(s => s.key),
  ...SUMMARY_KEYS,
]);

const otherInfo = (patient) =>
  Object.entries(patient.informations_medicales ?? {})
    .filter(([k]) => !claimedJsonbKeys.has(k));

const isPresent = (v) =>
  Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== '';



  const MiniCard = ({ title, children }) => (
        <div className="bg-white rounded-lg border border-gray/30 p-4">
            <h3 className="text-gray text-xs uppercase tracking-wide mb-2">{title}</h3>
            {children}
        </div>
    );
  const EmptyLine = ({ children }) => <p className="text-gray text-sm italic">{children}</p>;




const ProfilTab = ({ patient, onGoToDossier ,onSummarized }) => {
  const im = patient.informations_medicales ?? {};
  const antecedents = Array.isArray(im.antecedents) ? im.antecedents : [];
  const medicaments = Array.isArray(im.medicaments) ? im.medicaments : [];
  const chroniques = im.pathologies_chroniques;
  const others = otherInfo(patient);

    const [summarizing, setSummarizing] = useState(false);
    const [sumError, setSumError] = useState('');

    const handleSummarize = async () => {
      setSummarizing(true); setSumError('');
      const res = await summarizeHistory(patient.id_patient);
      setSummarizing(false);
      if (res.error) return setSumError(res.error);
      onSummarized?.();   
    };
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
        {KEY_METRICS.map((slot) => {
          const value = resolveSlot(im, slot);
          const present = isPresent(value);
          const showDanger = slot.danger && present;
          const display = !present ? '—' : Array.isArray(value) ? value.join(', ') : String(value);
          return (
            <div key={slot.key} className="bg-white rounded-lg border border-gray/30 p-3">
              <div className="flex flex-col">
                <span className="text-gray text-xs uppercase tracking-wide">{slot.label}</span>
                <span className={`mt-1 ${showDanger ? 'text-red font-medium flex items-center gap-1' : slot.mono ? 'data-value text-ink' : 'text-ink'}`}>
                  {showDanger && <AlertTriangle className="w-4 h-4" />}
                  {display}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        <div className="space-y-4">
          <MiniCard title="Antécédents clés">
            {antecedents.length ? (
              <ul className="list-disc list-inside text-sm text-ink space-y-1">
                {antecedents.slice(0, 3).map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            ) : <EmptyLine>Aucun antécédent enregistré</EmptyLine>}
          </MiniCard>

          <MiniCard title="Médicaments en cours">
            {medicaments.length ? (
              <ul className="list-disc list-inside text-sm text-ink space-y-1">
                {medicaments.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            ) : <EmptyLine>Aucun traitement en cours</EmptyLine>}
          </MiniCard>

          <MiniCard title="Pathologies chroniques">
            {isPresent(chroniques)
              ? <span className="text-sm text-ink">{chroniques}</span>
              : <EmptyLine>Non définie</EmptyLine>}
          </MiniCard>

          <button
            onClick={onGoToDossier}
            className="w-full py-2.5 bg-teal text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
          >
            Voir tout le dossier →
          </button>
        </div>

        <div className="border-l-4 border-amber bg-amber/5 rounded-r-lg p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-amber text-xs uppercase tracking-wide font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Résumé de l'historique complet (IA)
          </span>
          {patient.resume && patient.date_resume && (
            <span className="data-value text-gray text-xs shrink-0">{formatDate(patient.date_resume)}</span>
          )}
        </div>

        {summarizing ? (
          <div className="flex items-center justify-center gap-2 text-amber text-sm py-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Génération du résumé en cours…
          </div>
        ) : patient.resume ? (
    <>
      <p className="text-ink text-sm mt-2 whitespace-pre-line">{patient.resume}</p>
      <button onClick={handleSummarize} disabled={summarizing}
        className="mt-3 inline-flex items-center gap-1.5 text-teal text-sm font-semibold hover:opacity-80 disabled:opacity-40">
        <RefreshCw className="w-3.5 h-3.5" /> Actualiser le résumé
      </button>
    </>
  ) : (
    <div className="py-6 text-center">
      <p className="text-gray text-sm">Aucun résumé de l'historique complet.</p>
      <p className="text-gray/70 text-xs mt-1">L'IA synthétise l'ensemble des consultations validées.</p>
      <button onClick={handleSummarize} disabled={summarizing}
        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-40">
        <Sparkles className="w-4 h-4" /> Générer le résumé
      </button>
    </div>
  )}
  {sumError && <p className="text-red text-xs mt-2">{sumError}</p>}
</div>
      </div>

      {others.length > 0 && (
        <div className="mt-6">
          <h2 className="text-gray text-xs uppercase tracking-wide mb-2">Autres informations</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {others.map(([k, v]) => (
              <span key={k} className="text-gray">{k}: <span className="text-ink">{String(v)}</span></span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilTab;