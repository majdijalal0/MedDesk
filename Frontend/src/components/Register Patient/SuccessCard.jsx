
const SuccessCard = ({ createdPatient, doctorName, isSecretary, onReset, onBack }) => (
  <div className="bg-paper min-h-screen p-8 flex items-start justify-center">
    <div className="bg-white rounded-xl border border-teal/30 p-6 w-full max-w-md text-center shadow-sm">
      <div className="w-12 h-12 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
        ✓
      </div>
      <h2 className="font-display text-xl text-ink font-semibold">Patient inscrit</h2>
      <p className="text-gray text-sm mt-2">
        <span className="font-medium text-ink">{createdPatient.name}</span> a été inscrit
        {isSecretary && doctorName ? ` au dossier du Dr ${doctorName}` : ' à votre dossier'}.
      </p>
      <div className="flex gap-3 justify-center mt-6">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-lg bg-teal text-white text-sm font-medium hover:bg-teal/90 transition-colors"
        >
          Inscrire un autre
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-gray/30 text-ink text-sm font-medium hover:bg-gray/5 transition-colors"
        >
          Retour
        </button>
      </div>
    </div>
  </div>
);

export default SuccessCard