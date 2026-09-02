import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  UserRoundPlus,
  Stethoscope,
  Home,
  BookUser
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import DoctorSelector from './DoctorSelector';


const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, doctors, activeDoctorId, setActiveDoctor , logout } = useAuthStore();
  

  const menuItems = [
    { 
      icon: Home, 
      label: 'Acceuil', 
      path: '/dashboard/home',
      roles: ['médecin', 'secrétaire']
    },
    { 
      icon: Users, 
      label: 'Patients', 
      path: '/dashboard/patients',
      roles: ['médecin', 'secrétaire']
    },
    {
      icon: UserRoundPlus  ,
      label : 'Ajouter Patient',
      path : '/dashboard/addpatient',
      roles : ['médecin', 'secrétaire']
    },
    { 
      icon: Calendar, 
      label: 'Agenda', 
      path: '/dashboard/agenda',
      roles: ['médecin', 'secrétaire']
    },
    { 
      icon: BookUser, 
      label: 'Equipe', 
      path: '/dashboard/team',
      roles: ['médecin']
    },
    
  
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={`bg-slate-900 text-white h-screen sticky left-0 top-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-teal-500" />
            <span className="text-xl font-bold">MedDesk</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
            <UserCircle className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.nom_user} {user?.prenom_user}
              </p>
              <p className="text-xs text-gray-400 capitalize truncate">
                {user?.role}
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.filter((item)=>item.roles.includes(user.role)).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            
            <div key={item.path} className="relative">
              <button
                onClick={() => navigate(item.path)}
                onMouseEnter={() => isCollapsed && setShowTooltip(item.label)}
                onMouseLeave={() => setShowTooltip(null)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  active 
                    ? 'bg-teal-600 text-white' 
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
                {active && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>

              {isCollapsed && showTooltip === item.label && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45" />
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {user.role === 'secrétaire' && (
       <div className="px-3 mt-3">
          <span className="text-gray text-xs uppercase tracking-wide">Travaille pour</span>
          <div className="mt-1">
            {doctors.length === 0 ? (
              <div className="px-3 py-2 border border-gray/40 rounded-lg text-gray text-sm">
                Chargement...
            </div>
      ):(
        <DoctorSelector doctors={doctors} value={activeDoctorId} onChange={setActiveDoctor} compact /> )}
         </div>
      </div>
      )}
     

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          onMouseEnter={() => isCollapsed && setShowTooltip('Déconnexion')}
          onMouseLeave={() => setShowTooltip(null)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium">Déconnexion</span>}
        </button>

        {isCollapsed && showTooltip === 'Déconnexion' && (
          <div className="absolute left-full bottom-12 ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
            Déconnexion
            <div className="absolute left-0 bottom-1/2 translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;