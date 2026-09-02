import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Edit, 
  Trash2, 
  ChevronDown, 
  AlertCircle,
  UserCheck
} from 'lucide-react';

import { 
  getDoctorRdvs, 
  getTodayRdvs, 
  getRefDoctorRdvs, 
  updateRdvStatut, 
  updateRdv, 
  deleteRdv, 
  RDV_STATUS 
} from '../services/rdvServices';

import BookingModal from '../components/DashBoard/RDV/RdvModal'; 
import EditRdvModal from '../components/DashBoard/RDV/EditRdvModal';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/Loading';

const AgendaPage = () => {
  const [rdvs, setRdvs] = useState([]);
  const [editingRdv, setEditingRdv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); 

  const { user, activeDoctorId } = useAuthStore();
  const isSecretary = user?.role === 'secrétaire';
  const isDoctor = user?.role === 'médecin';

  const targetDoctorId = isSecretary 
    ? (activeDoctorId || user?.ref_doctor_id) 
    : ( user?.id_user);

  const loadRdvs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let response;

      if (targetDoctorId) {
        response = await getDoctorRdvs(targetDoctorId);
      } else if (isDoctor) {
        response = await getTodayRdvs();
      } else if (isSecretary && user?.ref_doctor_id) {
        response = await getRefDoctorRdvs(user.ref_doctor_id);
      } else {
        setError('Aucun médecin sélectionné');
        setLoading(false);
        return;
      }

      if (!response) {
        setError('Aucune réponse du serveur');
      } else if (response.error) {
        setError(response.error);
      } else {
        setRdvs(response.app ?? response.rdvs ?? (Array.isArray(response) ? response : []));
      }
    } catch (err) {
      setError('Erreur lors du chargement de l\'agenda');
    } finally {
      setLoading(false);
    }
  }, [targetDoctorId, isDoctor, isSecretary, user]);

  useEffect(() => {
    loadRdvs();
  }, [loadRdvs]);

  const handleStatusChange = async (idRdv, newStatus) => {
    const res = await updateRdvStatut(idRdv, newStatus , activeDoctorId);
    if (!res?.error) {
      setRdvs((prev) =>
        prev.map((r) => (r.id_rdv === idRdv ? { ...r, statut: newStatus } : r))
      );
    }
  };

  const handleUpdate = async (rdv, updates) => {
    const res = await updateRdv(rdv.id_rdv, {
      date_rdv: updates.date_rdv,
      statut: updates.statut,
      type: updates.type,
      id_user: updates.activeDoctorId
    });
    if (res?.error) {
      console.error(res.error);
      return;
    }
    loadRdvs();
  };

  const handleDelete = async (rdv) => {
    const patientName = `${rdv.nom_patient ?? ''} ${rdv.prenom_patient ?? ''}`.trim() || 'ce patient';
    if (!window.confirm(`Supprimer le rendez-vous de ${patientName} ?`)) return;

    const res = await deleteRdv(rdv.id_rdv,activeDoctorId);
    if (res?.error) {
      console.error(res.error);
      return;
    }
    loadRdvs();
  };

 const { upcomingList, todayList, completedList, canceledList, filteredList } = useMemo(() => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const q = searchQuery.trim().toLowerCase();
  const matchesSearch = (r) =>
    !q || 
    `${r.nom_patient} ${r.prenom_patient}`.toLowerCase().includes(q) || 
    (r.type && r.type.toLowerCase().includes(q));

  const upcoming = [];
  const today = [];
  const completed = [];
  const canceled = [];

  rdvs.forEach((r) => {
    if (!matchesSearch(r)) return;

    const rdvDate = new Date(r.date_rdv);
    const rdvDateStr = rdvDate.toISOString().split('T')[0];

    if (rdvDateStr === todayStr) {
      today.push(r);
    }

    if (r.statut === 'Terminé') {
      completed.push(r);
    } else if (r.statut === 'Annulé' || r.statut === 'Absent') {
      canceled.push(r);
    } else {
      upcoming.push(r);
    }
  });

  upcoming.sort((a, b) => new Date(a.date_rdv) - new Date(b.date_rdv));
  today.sort((a, b) => new Date(a.date_rdv) - new Date(b.date_rdv));

  completed.sort((a, b) => new Date(b.date_rdv) - new Date(a.date_rdv));
  canceled.sort((a, b) => new Date(b.date_rdv) - new Date(a.date_rdv));

  let activeList = upcoming;
  if (activeTab === 'today') activeList = today;
  if (activeTab === 'completed') activeList = completed;
  if (activeTab === 'canceled') activeList = canceled;
  if (activeTab === 'all') {
    activeList = [...rdvs].filter(matchesSearch).sort((a, b) => new Date(b.date_rdv) - new Date(a.date_rdv));
  }

  return {
    upcomingList: upcoming,
    todayList: today,
    completedList: completed,
    canceledList: canceled,
    filteredList: activeList,
  };
}, [rdvs, searchQuery, activeTab]);

  const RdvRow = ({ r }) => {
    const statusConfig = RDV_STATUS[r.statut] || { label: r.statut, cls: 'bg-gray/10 text-gray' };

    return (
      <li className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-teal/5 transition-all gap-4 border-b border-gray/10 last:border-0 group">
        
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-paper border border-gray/20 shrink-0 text-center">
            <CalendarIcon className="w-4 h-4 text-teal mb-0.5" />
            <span className="text-[10px] font-mono text-gray font-bold uppercase">
              {new Date(r.date_rdv).toLocaleDateString('fr-FR', { month: 'short' })}
            </span>
          </div>

          <div className="min-w-0">
            <Link
              to={`/dashboard/patient/${r.id_patient}`}
              className="text-ink font-semibold text-sm hover:text-teal transition-colors truncate block"
            >
              {r.nom_patient} {r.prenom_patient}
            </Link>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-teal" />
                {new Date(r.date_rdv).toLocaleString('fr-FR', {day: '2-digit',month: '2-digit',hour: '2-digit',minute: '2-digit'})}
              </span>
              {r.type && (
                <>
                  <span>•</span>
                  <span className="bg-gray/10 px-2 py-0.5 rounded text-[11px] font-sans font-medium text-gray/80">
                    {r.type}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          
          <div className="relative inline-block text-left">
            <select
              value={r.statut}
              onChange={(e) => handleStatusChange(r.id_rdv, e.target.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal/30 transition-all ${statusConfig.cls}`}
            >
              {Object.keys(RDV_STATUS).map((statusKey) => (
                <option key={statusKey} value={statusKey}>
                  {RDV_STATUS[statusKey].label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
          </div>

          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditingRdv(r)}
              className="p-1.5 rounded-lg text-gray hover:text-teal hover:bg-teal/10 transition-colors"
              title="Modifier le rendez-vous"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(r)}
              className="p-1.5 rounded-lg text-gray hover:text-red hover:bg-red/10 transition-colors"
              title="Supprimer le rendez-vous"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </li>
    );
  };

  return (
    <div className="bg-paper min-h-screen p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink">Agenda</h1>
            {isSecretary && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal/10 text-teal text-xs font-medium">
                <UserCheck className="w-3 h-3" /> Secrétariat
              </span>
            )}
          </div>
          <p className="text-gray text-sm mt-0.5">
            Gérez vos consultations, plannings et rendez-vous patients
          </p>
        </div>

        <button
          onClick={() => setBooking(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-xs font-semibold hover:bg-teal/90 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau rendez-vous</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray/20 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par patient ou type..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray/20 text-xs text-ink placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-paper p-1 rounded-xl border border-gray/15 self-start md:self-auto overflow-x-auto">
           <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-teal shadow-xs'
                  : 'text-gray hover:text-ink'
              }`}
            >
              Tous ({rdvs.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'bg-white text-teal shadow-xs'
                  : 'text-gray hover:text-ink'
              }`}
            >
              À venir ({upcomingList.length})
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'today'
                  ? 'bg-white text-teal shadow-xs'
                  : 'text-gray hover:text-ink'
              }`}
            >
              Aujourd'hui ({todayList.length})
            </button>
             <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'bg-white text-teal shadow-xs'
                  : 'text-gray hover:text-ink'
              }`}
            >
              Terminé ({completedList.length})
            </button>
            <button
              onClick={() => setActiveTab('canceled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'canceled'
                  ? 'bg-white text-teal shadow-xs'
                  : 'text-gray hover:text-ink'
              }`}
            >
              Annulé ({canceledList.length})
            </button>
            
          </div>

        </div>
      </div>

      {loading ? <Loading/>
       : error ? (
        <div className="p-4 bg-red/10 border border-red/20 rounded-2xl text-red text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (

        <div className="bg-white rounded-2xl border border-gray/20 shadow-xs overflow-hidden">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="w-10 h-10 text-gray/30 mx-auto mb-3" />
              <p className="text-gray text-sm italic font-medium">Aucun rendez-vous trouvé</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-teal font-semibold hover:underline"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray/10">
              {filteredList.map((r) => (
                <RdvRow key={r.id_rdv} r={r} />
              ))}
            </ul>
          )}
        </div>
      )}

      {editingRdv && (
        <EditRdvModal
          rdv={editingRdv}
          doctorId={targetDoctorId}
          onSaved={(rdv, updates) => {
            handleUpdate(rdv, updates);
            setEditingRdv(null);
          }}
          onClose={()=>{setEditingRdv(null)}}
        
        />
      )}

      {booking && (
        <BookingModal
          doctorId={targetDoctorId}
          onClose={() => setBooking(false)}
          onSaved={loadRdvs}
        />
      )}

    </div>
  );
};

export default AgendaPage;