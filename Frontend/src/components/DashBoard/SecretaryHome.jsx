import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Calendar, Clock, UserPlus, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getRefDoctorRdvs , SEG , ORDER } from "../../services/rdvServices";
import { fmtDate,fmtTime } from "../../utils/format";
import Loading from "../Loading";
import ErrorPage from "../ErrorPage";



const SecretaryHome = () => {
  const { activeDoctorId, doctors } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const doc = doctors?.find((d) => d.id_user === activeDoctorId);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      const r = await getRefDoctorRdvs(activeDoctorId);

      if (!isMounted) return;

      if (!r) setError("Aucune réponse du serveur.");
      else if (r.error) setError(r.error);
      else setData(r);

      setLoading(false);
    };

    if (activeDoctorId) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [activeDoctorId]);

  if (loading) return <Loading />;

  if (error) return <ErrorPage error={error}/>;

  const breakdown = data?.breakdown || { 'En attente': 0, 'Confirmé': 0, 'Terminé': 0, 'Annulé': 0, total: 0 };
  const next = data?.next || [];
  const pending = data?.pending || [];
  const total = breakdown.total;

  return (
    <div className="bg-paper min-h-screen p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink font-bold">Aujourd'hui</h1>
          <p className="text-gray text-sm mt-0.5">
            Planning de <span className="text-ink font-semibold">Dr {doc ? `${doc.nom_user} ${doc.prenom_user}` : "—"}</span>
            <span className="mx-2">·</span>Vue secrétariat — agenda & inscriptions
          </p>
        </div>

        <Link
          to="/dashboard/addpatient"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors shadow-xs shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nouveau patient</span>
        </Link>
      </div>

      <section className="bg-white rounded-xl border border-gray/20 p-5 shadow-xs">
        <div className="flex items-baseline justify-between">
          <span className="text-gray text-xs font-semibold uppercase tracking-wider">
            Aperçu de la journée
          </span>
          <span className="text-ink text-2xl font-bold font-mono">{total} RDV</span>
        </div>

        {total === 0 ? (
          <div className="mt-3 h-3 rounded-full bg-gray/10" />
        ) : (
          <div className="mt-3 flex h-3 rounded-full overflow-hidden bg-gray/10">
            {ORDER.map((s) => {
              const c = breakdown[s] || 0;
              if (!c) return null;
              return (
                <div
                  key={s}
                  className={`${SEG[s].bar} transition-all`}
                  style={{ width: `${(c / total) * 100}%` }}
                  title={`${s} : ${c}`}
                />
              );
            })}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {ORDER.map((s) => (
            <div key={s} className="flex items-center justify-between p-2.5 rounded-lg bg-paper border border-gray/10">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${SEG[s].swatch}`} />
                <span className="text-ink text-xs font-medium">{s}</span>
              </div>
              <span className="text-ink font-bold font-mono text-sm">{breakdown[s] || 0}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <section className="bg-white rounded-xl border border-gray/20 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal" />
                Prochains rendez-vous
              </span>
              <Link to="/dashboard/agenda" className="text-teal text-xs font-semibold hover:underline flex items-center gap-0.5">
                Voir l'agenda <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {next.length === 0 ? (
              <p className="py-8 text-center text-gray text-sm italic">Aucun rendez-vous à venir</p>
            ) : (
              <ul className="space-y-2.5">
                {next.map((r) => (
                  <li key={r.id_rdv}>
                    <div
                      
                      className="group flex items-center justify-between p-3 rounded-lg border border-gray/10 hover:border-teal/40 hover:bg-teal/5 transition-all"
                    >
                      <div>
                        <p className="text-ink font-semibold text-sm group-hover:text-teal transition-colors">
                          {r.nom_patient} {r.prenom_patient}
                        </p>
                        <span className="text-xs text-gray">{r.type}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-gray">
                        <Clock className="w-3.5 h-3.5 text-gray/60" />
                        <span>{fmtDate(r.date_rdv)} - {fmtTime(r.date_rdv)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray/20 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                À confirmer ({pending.length})
              </span>
            </div>

            {pending.length === 0 ? (
              <p className="py-8 text-center text-gray text-sm italic">Toutes les demandes sont traitées</p>
            ) : (
              <ul className="space-y-2.5">
                {pending.map((r) => (
                  <li
                    key={r.id_rdv}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-gray/10 bg-paper/50"
                  >
                    <div>
                      <div
                        className="text-ink font-semibold text-sm hover:text-teal transition-colors"
                      >
                        {r.nom_patient} {r.prenom_patient}
                      </div>
                      <p className="text-xs text-gray font-mono">
                        {fmtDate(r.date_rdv)} à {fmtTime(r.date_rdv)} · {r.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {r.telephone ? (
                        <a
                          href={`tel:${r.telephone}`}
                          title={`Appeler le ${r.telephone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal text-white text-xs font-medium hover:bg-teal/90 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Appeler</span>
                        </a>
                      ) : (
                        <span className="text-gray text-xs italic px-2 py-1 bg-gray/10 rounded">
                          N° manquant
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default SecretaryHome;