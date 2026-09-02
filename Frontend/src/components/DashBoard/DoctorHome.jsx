import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  FileText, 
  History, 
  ChevronRight, 
  UserCheck
} from "lucide-react";
import { getTodayRdvs } from "../../services/rdvServices";
import { fmtDate, fmtTime } from "../../utils/format";
import Loading from "../Loading";
import ErrorPage from "../ErrorPage";

const DoctorHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const lastPatient = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("lastPatient"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      const r = await getTodayRdvs();

      if (!isMounted) return;

      if (!r) setError("Aucune réponse du serveur.");
      else if (r.error) setError(r.error);
      else setData(r);

      setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <Loading />;

  if (error) return <ErrorPage error={error}/>;

  const progress = data?.progress || { seen: 0, total: 0 };
  const todayList = data?.today || [];
  const nextList = data?.next || [];
  const pendingNotes = data?.pending || [];

  const pct = progress.total ? Math.round((progress.seen / progress.total) * 100) : 0;

  return (
    <div className="bg-paper min-h-screen p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink font-bold">Aujourd'hui</h1>
          <p className="text-gray text-sm mt-0.5">
            Aperçu de la journée et activités médicales en attente
          </p>
        </div>

        {lastPatient?.id && (
          <Link
            to={`/dashboard/patient/${lastPatient.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray/20 text-ink text-xs font-semibold hover:border-teal/50 hover:text-teal transition-all shadow-xs shrink-0"
          >
            <History className="w-4 h-4 text-teal" />
            <span>Reprendre : <strong>{lastPatient.name}</strong></span>
            <ChevronRight className="w-3.5 h-3.5 text-gray/60" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <section className="bg-white rounded-xl border border-gray/20 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-gray text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal" />
              Patients vus aujourd'hui
            </span>
            <span className="text-ink text-2xl font-bold font-mono">
              {progress.seen} <span className="text-gray text-base font-normal">/ {progress.total}</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray mb-1.5">
              <span>Progression</span>
              <span className="font-mono font-medium text-ink">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </section>

        <section className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between ${
          pendingNotes.length > 0 
            ? "bg-amber-50/50 border-amber-200" 
            : "bg-white border-gray/20"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              pendingNotes.length > 0 ? "text-amber-800" : "text-gray"
            }`}>
              <FileText className={`w-4 h-4 ${pendingNotes.length > 0 ? "text-amber-600" : "text-gray/60"}`} />
              Notes IA à valider
            </span>
            <span className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded-full ${
              pendingNotes.length > 0 
                ? "bg-amber-200/60 text-amber-900" 
                : "bg-gray/10 text-gray"
            }`}>
              {pendingNotes.length}
            </span>
          </div>

          {pendingNotes.length === 0 ? (
            <p className="mt-4 text-gray text-sm italic">Toutes les notes de consultation sont validées.</p>
          ) : (
            <ul className="mt-3 space-y-2 max-h-28 overflow-y-auto pr-1">
              {pendingNotes.map((n) => (
                <li key={n.id_note} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-amber-200/60">
                  <Link
                    to={`/dashboard/patient/${n.id_patient}`}
                    className="text-ink font-semibold hover:text-teal transition-colors"
                  >
                    {n.nom_patient} {n.prenom_patient}
                  </Link>
                  <span className="text-gray/80 font-mono">
                    {fmtDate(n.date_creation)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <section className="bg-white rounded-xl border border-gray/20 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal" />
              Programme d'aujourd'hui
            </span>
            <span className="text-xs text-gray font-mono">{todayList.length} rendez-vous</span>
          </div>

          {todayList.length === 0 ? (
            <p className="py-8 text-center text-gray text-sm italic">Aucun rendez-vous prévu aujourd'hui</p>
          ) : (
            <ul className="space-y-2.5">
              {todayList.map((r) => {
                const isSeen = r.statut === "Terminé";
                return (
                  <li key={r.id_rdv}>
                    <Link
                      to={`/dashboard/patient/${r.id_patient}`}
                      className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isSeen 
                          ? "bg-paper/50 border-gray/10 opacity-75" 
                          : "border-gray/10 hover:border-teal/40 hover:bg-teal/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${isSeen ? "bg-emerald-500" : "bg-teal"}`} />
                        <div>
                          <p className={`text-sm font-semibold transition-colors ${
                            isSeen ? "text-gray line-through" : "text-ink group-hover:text-teal"
                          }`}>
                            {r.nom_patient} {r.prenom_patient}
                          </p>
                          <span className="text-xs text-gray/80">{r.type}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          isSeen ? "bg-emerald-50 text-emerald-700" : "bg-teal/10 text-teal"
                        }`}>
                          {r.statut}
                        </span>
                        <span className="text-xs font-mono text-gray">
                          {fmtTime(r.date_rdv)}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray/20 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal" />
              Prochains jours
            </span>
            <Link to="/dashboard/agenda" className="text-teal text-xs font-semibold hover:underline flex items-center gap-0.5">
              Agenda <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {nextList.length === 0 ? (
            <p className="py-8 text-center text-gray text-sm italic">Aucun rendez-vous à venir</p>
          ) : (
            <ul className="space-y-2.5">
              {nextList.map((r) => (
                <li key={r.id_rdv}>
                  <Link
                    to={`/dashboard/patient/${r.id_patient}`}
                    className="group flex items-center justify-between p-3 rounded-lg border border-gray/10 hover:border-teal/40 hover:bg-teal/5 transition-all"
                  >
                    <div>
                      <p className="text-ink font-semibold text-sm group-hover:text-teal transition-colors">
                        {r.nom_patient} {r.prenom_patient}
                      </p>
                      <span className="text-xs text-gray">{r.type}</span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-mono text-ink font-medium">
                        {fmtDate(r.date_rdv)}
                      </p>
                      <span className="text-xs font-mono text-gray">
                        {fmtTime(r.date_rdv)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
};

export default DoctorHome;