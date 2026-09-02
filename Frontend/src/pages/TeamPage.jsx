import { useEffect, useState } from 'react';
import {getMySecretaries,addSecretary,removeSecretary} from '../services/teamServices';
import Loading from '../components/Loading';

const TeamPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const r = await getMySecretaries();
    if (r?.error) setError(r.error); else setTeam(r.secretaries ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setMsg('');
    const r = await addSecretary(email);
    if (r.error) return setMsg(r.error);
    setEmail(''); setMsg('Secrétaire ajoutée.'); load();
  };
  const handleRemove = async (id) => {
    const r = await removeSecretary(id);
    if (r.error) return setMsg(r.error);
    load();  
  };

  return (
    <div className="bg-paper min-h-screen p-8 space-y-6">
      <h1 className="font-display text-2xl text-ink">Mon équipe</h1>

      <section className="bg-white rounded-lg border border-gray/30 p-4">
        <label className="text-gray text-xs uppercase tracking-wide">Ajouter une secrétaire</label>
        <div className="flex gap-2 mt-2">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email de la secrétaire"
            className="flex-1 rounded-lg border border-gray/40 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal" />
          <button onClick={handleAdd} disabled={!email.trim()}
            className="px-4 py-2 rounded-lg bg-teal text-white text-sm font-semibold disabled:opacity-40">Ajouter</button>
        </div>
        <p className="text-gray text-xs mt-2">La secrétaire doit déjà avoir un compte. Le lien est réversible.</p>
        {msg && <p className="text-sm mt-2 text-ink">{msg}</p>}
      </section>

      <section className="bg-white rounded-lg border border-gray/30">
        <div className="px-4 py-3 border-b border-gray/20 text-ink text-sm font-semibold">
          Secrétaires <span className="data-value text-gray ml-2">({team.length})</span>
        </div>
        {loading ? <Loading />
          : error ? <p className="px-4 py-3 text-red text-sm">{error}</p>
          : team.length === 0 ? <p className="px-4 py-3 text-gray text-sm italic">Aucune secrétaire assignée</p>
          : <ul className="divide-y divide-gray/20">
              {team.map(s => (
                <li key={s.id_user} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm">
                    <span className="text-ink font-medium">{s.nom_user} {s.prenom_user}</span>
                    <span className="data-value text-gray ml-2">{s.email}</span>
                  </span>
                  <button onClick={() => handleRemove(s.id_user)}
                    className="px-3 py-1.5 rounded-lg border border-gray/40 text-gray text-sm hover:text-ink">Retirer</button>
                </li>
              ))}
            </ul>}
      </section>
    </div>
  );
};
export default TeamPage;