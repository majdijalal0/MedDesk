import { create } from 'zustand';
import { getMyDoctors } from '../services/teamServices'; 

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  doctors: [],
  activeDoctorId: null,

  setUser: (userData) => set({ user: userData, isAuthenticated: true }),
  setDoctors: (doctors) => set({ doctors }),
  
  setActiveDoctor: (id) => { 
    if (id) {
      localStorage.setItem('activeDoctorId', id); 
    } else {
      localStorage.removeItem('activeDoctorId');
    }
    set({ activeDoctorId: id }); 
  },

  initUserSession: async (userData) => {
    set({ user: userData, isAuthenticated: true });

    if (userData?.role === 'secrétaire') {
      try {
        const d = await getMyDoctors();
        const doctors = d.doctors ?? [];
        set({ doctors });

        const stored = Number(localStorage.getItem('activeDoctorId'));
        const valid = doctors.some(x => x.id_user === stored);

        if (valid) {
          get().setActiveDoctor(stored);
        } else if (doctors.length === 1) {
          get().setActiveDoctor(doctors[0].id_user);
        } else {
          get().setActiveDoctor(null);
        }
      } catch (err) {
        console.error("Failed to load doctors:", err);
        set({ doctors: [], activeDoctorId: null });
      }
    } else {
      
      localStorage.removeItem('activeDoctorId');
      set({ doctors: [], activeDoctorId: null });
    }
  },

  clearContext: () => { 
    localStorage.removeItem('activeDoctorId'); 
    set({ activeDoctorId: null, doctors: [] }); 
  },

  logout: () => {
    get().clearContext();       
    set({ user: null, isAuthenticated: false });
  },
}));