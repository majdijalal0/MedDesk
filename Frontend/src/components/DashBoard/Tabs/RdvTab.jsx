import { useEffect, useState } from 'react';
import { getRdvs, updateRdvStatut, updateRdv, RDV_STATUS, deleteRdv } from '../../../services/rdvServices';
import RdvModal from '../RDV/RdvModal';
import EditRdvModal from '../RDV/EditRdvModal';
import { Edit, Trash2 } from 'lucide-react';
import { fmt } from '../../../utils/format';
import Loading from '../../Loading'
import ErrorPage from '../../ErrorPage';

const RdvTab = ({ patientId, patientName }) => {
  const [rdvs, setRdvs] = useState([]);
  const [editingRdv, setEditingRdv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  const loadRdvs = async () => {
    setLoading(true); 
    setError('');
    const r = await getRdvs(patientId);
    if (!r) setError('Aucune réponse du serveur');
    else if (r.error) setError(r.error);
    else setRdvs(r.app ?? []);
    setLoading(false);
  };

  useEffect(() => { loadRdvs(); }, [patientId]);   

  const handleUpdate = async (rdv, updates) => {
    const res = await updateRdv(rdv.id_rdv, {
      date_rdv: updates.date_rdv,
      statut: updates.statut,
      type: updates.type,
    });
    if (res.error) {
      console.error(res.error);
      return;
    }
    await loadRdvs();  
  };

  const handleDelete = async (rdv) => {
    if (!window.confirm('Supprimer ce rendez-vous ?')) return;
    const res = await deleteRdv(rdv.id_rdv);
    if (res.error) {
      console.error(res.error);
      return;
    }
    await loadRdvs();  
  };

  const terminate = async (id) => { 
    const r = await updateRdvStatut(id, 'Terminé'); 
    if (!r.error) loadRdvs(); 
  };

  const now = Date.now();
  const prochain = rdvs
    .filter((r) => ['En attente', 'Confirmé'].includes(r.statut) && new Date(r.date_rdv).getTime() >= now)
    .sort((a, b) => new Date(a.date_rdv) - new Date(b.date_rdv))[0] ?? null;

  const others = rdvs
    .filter((r) => r.id_rdv !== prochain?.id_rdv)
    .sort((a, b) => new Date(b.date_rdv) - new Date(a.date_rdv));

  if (loading) return  <Loading />;
  if (error)   return <ErrorPage error={error}/>;

  const Row = ({ r }) => {
    const st = RDV_STATUS[r.statut] ?? { label: r.statut, cls: 'bg-gray/15 text-gray' };
    const isPendingOrConfirmed = ['En attente', 'Confirmé'].includes(r.statut);

    return (
      <li className="flex items-center justify-between px-4 py-2.5 group">
        <span className="flex items-center gap-3 text-sm">
          <span className="data-value text-gray">{fmt(r.date_rdv)}</span>
          <span className="text-ink">{r.type}</span>
        </span>
        <span className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded ${st.cls}`}>{st.label}</span>
          {isPendingOrConfirmed && (
            <button onClick={() => terminate(r.id_rdv)} className="text-teal text-xs font-medium hover:opacity-80">
              Terminer
            </button>
          )}
          <button 
            onClick={() => setEditingRdv(r)} 
            className="p-1.5 rounded-lg text-gray hover:text-ink hover:bg-gray/10 opacity-0 group-hover:opacity-100 transition-opacity" 
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(r)} 
            className="p-1.5 rounded-lg text-gray hover:text-red hover:bg-red/10 opacity-0 group-hover:opacity-100 transition-opacity" 
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </span>
      </li>
    );
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="bg-white rounded-lg border border-gray/30 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-gray text-xs uppercase tracking-wide">Prochain rendez-vous</h3>
          <button onClick={() => setBooking(true)} className="px-3 py-1.5 rounded-lg bg-teal text-white text-sm font-semibold">
            + Nouveau rendez-vous
          </button>
        </div>
        {prochain ? (
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="data-value text-ink text-lg">{fmt(prochain.date_rdv)}</div>
              <div className="text-gray text-sm">{prochain.type}</div>
            </div>
            <button onClick={() => terminate(prochain.id_rdv)} className="text-teal text-sm font-medium hover:opacity-80">
              Marquer terminé
            </button>
          </div>
        ) : (
          <p className="mt-3 text-gray text-sm italic">Aucun rendez-vous à venir</p>
        )}
      </section>

      <section className="bg-white rounded-lg border border-gray/30">
        <div className="px-4 py-3 border-b border-gray/20">
          <span className="text-ink text-sm font-semibold">
            Autres rendez-vous <span className="data-value text-gray ml-2">({others.length})</span>
          </span>
        </div>

        {others.length === 0 ? (
          <p className="px-4 py-3 text-gray text-sm italic">Aucun autre rendez-vous</p>
        ) : (
          <ul className="divide-y divide-gray/20">
            {others.map((r) => (
              <Row key={r.id_rdv} r={r} />
            ))}
          </ul>
        )}
      </section>

      {editingRdv && (
        <EditRdvModal 
          rdv={editingRdv} 
          onClose={() => setEditingRdv(null)} 
          onSaved={(rdv, updates) => { 
            handleUpdate(rdv, updates);
            setEditingRdv(null);
          }}
        />
      )}
      {booking && (
        <RdvModal 
          patientId={patientId} 
          patientName={patientName} 
          onClose={() => setBooking(false)} 
          onSaved={loadRdvs} 
        />
      )}
    </div>
  );
};

export default RdvTab;