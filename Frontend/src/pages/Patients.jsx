import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, Phone, ChevronRight, Pencil } from "lucide-react";
import { computeAge, SEXE_LABEL } from "../utils/format";
import { getPatients } from "../services/patientServices";
import { formatPatientId } from "../utils/format";
import { useAuthStore } from "../store/authStore";
import Loading from "../components/Loading";
import ErrorPage from "../components/ErrorPage"
import EditPatientModal from "../components/EditPatientModal";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);

  const { activeDoctorId } = useAuthStore();

  const loadPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getPatients(activeDoctorId);
      if (result.error) setError(result.error);
      else setPatients(result.patients ?? []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [activeDoctorId]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return patients.filter((p) => {
      if (!q) return true;
      const haystack = [
        `${p.nom_patient} ${p.prenom_patient}`,
        formatPatientId(p.id_patient),
        p.telephone ?? "",
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [patients, searchQuery]);

  if (loading) return <Loading />;
  if (error) return <ErrorPage error={error} />;

  return (
    <div className="bg-paper min-h-screen">
      <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur-xs border-b border-gray/20 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou identifiant ou par telephone"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray/30 text-ink text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className="text-gray text-xs font-medium uppercase tracking-wider">
              {filteredPatients.length} {filteredPatients.length > 1 ? "patients" : "patient"}
            </span>
            <Link
              to="/dashboard/addpatient"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouveau patient</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-3">
        {filteredPatients.length === 0 && (
          <div className="bg-white rounded-xl border border-gray/20 p-8 text-center max-w-md mx-auto my-8 space-y-3">
            <p className="text-ink font-medium text-base">
              {patients.length === 0
                ? "Aucun patient enregistré"
                : "Aucun résultat pour cette recherche"}
            </p>
            <p className="text-gray text-sm">
              {patients.length === 0
                ? "Commencez par inscrire un nouveau patient dans votre dossier."
                : "Vérifiez l'orthographe ou tentez une recherche par numéro de téléphone."}
            </p>
            {patients.length === 0 && (
              <Link
                to="/dashboard/addpatient"
                className="inline-block mt-2 text-teal text-sm font-semibold hover:underline"
              >
                + Ajouter un patient
              </Link>
            )}
          </div>
        )}

        {filteredPatients.map((p) => {
          const age = computeAge(p.date_naissance);
          const ta = p.informations_medicales?.ta;
          const condition = p.informations_medicales?.pathologies_chroniques?.[0];

          return (
            <div
              key={p.id_patient}
              className="group relative bg-white rounded-xl border border-gray/20 p-5 hover:border-teal/50 hover:shadow-md transition-all space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="font-mono bg-gray/10 px-2 py-0.5 rounded text-gray/80 font-medium text-xs">
                  {formatPatientId(p.id_patient)}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPatient(p);
                  }}
                  className="p-1.5 rounded-lg text-gray hover:text-teal hover:bg-teal/10 transition-colors"
                  title="Modifier le patient"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <Link
                to={`/dashboard/patient/${p.id_patient}`}
                className="block space-y-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray mb-1">
                    <span>
                      {age !== null ? `${age} ans` : "—"} · {SEXE_LABEL[p.sexe] ?? p.sexe ?? "—"}
                    </span>
                  </div>

                  <h2 className="font-display text-xl text-ink font-semibold mt-2">
                    {p.nom_patient} {p.prenom_patient}
                  </h2>

                  {p.telephone && (
                    <p className="inline-flex items-center gap-1.5 text-xs text-gray/80 mt-1">
                      <Phone className="w-3 h-3 text-gray/60" />
                      <span>{p.telephone}</span>
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray/10 flex items-center justify-between min-h-[36px]">
                  {ta && (
                    <span className="bg-paper px-2 py-1 rounded border border-gray/20 text-gray">
                      TA: <strong className="text-ink font-mono">{ta}</strong>
                    </span>
                  )}
                  {condition && (
                    <span className="bg-teal/10 text-teal font-medium px-2.5 py-1 rounded-full text-xs">
                      {condition}
                    </span>
                  )}
                </div>

                <span className="text-teal text-xs font-semibold inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Dossier <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          onSaved={() => {
            setEditingPatient(null);
            loadPatients();
          }}
          onClose={() => setEditingPatient(null)}
        />
      )}
    </div>
  );
};

export default Patients;