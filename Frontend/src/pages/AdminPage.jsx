import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Loader2,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CreateUserModal from '../components/Admin/CreateUserModal';
import { changeStatus,getUsers } from '../services/adminServices';

const AdminPage = () => {
  const { user, logout } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getUsers();
      if (response?.users) {
        setUsers(response.users);
      }
      console.log(response)
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Impossible de charger la liste des utilisateurs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (targetUser) => {
    const newStatus = !targetUser.is_active;
    setActionLoadingId(targetUser.id_user);
    setError('');

    try {
      const response = await changeStatus(targetUser.id_user,newStatus)

      if (response?.user) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id_user === targetUser.id_user ? { ...u, is_active: newStatus } : u
          )
        );
      }
    } catch (err) {
      const apiErr = err.response?.data?.error || "Erreur lors de la modification du statut.";
      setError(apiErr);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const stats = useMemo(() => {
    const total = users.length;
    const doctors = users.filter((u) => u.role === 'médecin' && u.is_active).length;
    const secretaries = users.filter((u) => u.role === 'secrétaire' && u.is_active).length;
    const inactive = users.filter((u) => !u.is_active).length;

    return { total, doctors, secretaries, inactive };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.prenom_user || ''} ${u.nom_user || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = fullName.includes(query) || email.includes(query);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-teal-500" />
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">MedDesk</span>
              <span className="ml-2.5 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Administration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {user?.nom_user ? ` ${user.nom_user}` : 'Administrateur'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-sm text-gray-500 mt-1">
              Superviser les comptes, attribuer des rôles et gérer les accès au système.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            <span>Nouvel Utilisateur</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Comptes</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-lg">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Médecins Actifs</p>
              <p className="text-xl font-bold text-gray-900">{stats.doctors}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Secrétaires Actifs</p>
              <p className="text-xl font-bold text-gray-900">{stats.secretaries}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Désactivés</p>
              <p className="text-xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Filtrer par rôle :</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-700"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="médecin">Médecins</option>
              <option value="secrétaire">Secrétaires</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-teal-700 mb-2" />
              <p className="text-sm font-medium">Chargement des utilisateurs...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-semibold text-gray-700">Aucun utilisateur trouvé</p>
              <p className="text-sm mt-1">Essayez de modifier votre recherche ou vos filtres.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Utilisateur</th>
                    <th className="py-3.5 px-6">Rôle</th>
                    <th className="py-3.5 px-6">Statut</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredUsers.map((u) => {
                    const isSelf = String(u.id_user) === String(user?.id_user || user?.id);
                    const isActionBusy = actionLoadingId === u.id_user;

                    return (
                      <tr key={u.id_user} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                              {u.prenom_user?.[0]?.toUpperCase() || ''}{u.nom_user?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {u.prenom_user} {u.nom_user}
                                {isSelf && (
                                  <span className="ml-2 text-xs font-normal text-gray-500">(Vous)</span>
                                )}
                              </div>
                              <div className="text-gray-500 text-xs mt-0.5">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              Admin
                            </span>
                          ) : u.role === 'médecin' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              Médecin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              Secrétaire
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              Inactif
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          {isSelf ? (
                            <span className="text-xs text-gray-400 italic">Compte actuel</span>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isActionBusy}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                                u.is_active
                                  ? 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100'
                                  : 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {isActionBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : u.is_active ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Désactiver</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Réactiver</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default AdminPage;