import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DoctorSelector = ({ doctors, value, onChange, compact }) => {
  const [openDropdown, setOpenDropdown] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const ref = useRef();

  const current = doctors.find(d => d.id_user === value);

  const searchedDoctors = doctors.filter(d =>
    `${d.nom_user} ${d.prenom_user}`.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpenDropdown(o => !o)}
        className={`flex items-center justify-between gap-2 rounded-lg border border-gray/40 text-ink text-sm ${compact ? 'w-full px-3 py-1.5' : 'px-4 py-2'}`}>
        <span className="truncate">{current ? `Dr ${current.nom_user} ${current.prenom_user}` : 'Choisir un médecin'}</span>
        <ChevronDown className="w-4 h-4 text-gray shrink-0" />
      </button>

      {openDropdown && (
        <div className="absolute left-0 mt-1 w-64 bg-white border border-gray/30 rounded-lg shadow-lg z-20">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un médecin"
            className="w-full px-3 py-2 text-sm text-ink border-b text-black border-gray/20 rounded-t-lg focus:outline-none" />
          <ul className="max-h-48 overflow-y-auto">
            {searchedDoctors.length === 0
              ? <li className="px-3 py-2 text-gray text-sm">Aucun médecin</li>
              : searchedDoctors.map(d => (
                <li key={d.id_user}>
                  <button onClick={() => { onChange(d.id_user); setOpenDropdown(false); setSearchQuery(''); }}
                    className="w-full text-left px-3 py-2 text-sm text-black hover:bg-paper">
                    Dr {d.nom_user} {d.prenom_user}
                  </button>
                </li>))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default DoctorSelector;