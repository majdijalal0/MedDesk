import DoctorHome from "../components/DashBoard/DoctorHome";
import SecretaryHome from "../components/DashBoard/SecretaryHome";
import { useAuthStore } from "../store/authStore";
import DoctorSelector from "../components/DoctorSelector";

const HomePage = () => {
  const { user, doctors, activeDoctorId } = useAuthStore();
  if (user.role === 'médecin') return <DoctorHome />;
  if (!activeDoctorId)
    return (
      <div className="bg-paper min-h-screen flex items-center justify-center p-8">
        <div className="bg-white rounded-xl border border-gray/30 p-6 w-full max-w-sm text-center">
          <h1 className="font-display text-lg text-ink">Choisissez un médecin</h1>
          <p className="text-gray text-sm mt-1">Sélectionnez le médecin pour lequel vous travaillez aujourd'hui.</p>
          <div className="mt-4"><DoctorSelector doctors={doctors} value={null} onChange={useAuthStore.getState().setActiveDoctor} /></div>
        </div>
      </div>
    );
  if(user.role === 'secrétaire' && activeDoctorId) return <SecretaryHome />;
};

export default HomePage;