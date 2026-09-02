import {  useParams } from 'react-router-dom';
import { getPatient } from '../services/patientServices';
import { useEffect, useState } from 'react';
import Header from '../components/DashBoard/Tabs/Header';
import ProfilTab from '../components/DashBoard/Tabs/ProfileTab';
import DossierTab from '../components/DashBoard/Tabs/DossierTab/DossierTab';
import RdvTab from '../components/DashBoard/Tabs/RdvTab';
import {formatDate} from '../utils/format'
import Loading from '../components/Loading';
import ErrorPage from '../components/ErrorPage';




const PatientProfile = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profil');

  const [error, setError] = useState('');

  const refreshPatient = async () => {
      setLoading(true);
      setError('');
      const response = await getPatient(id);
      if (!response)            setError('Aucune réponse du serveur');
      else if (response.error)  setError(response.error);
      else                      setPatient(response.patient ?? response);
      setLoading(false);
    };

  useEffect(() => { refreshPatient();  }, [id]);

  useEffect(() => {
  if (patient) localStorage.setItem('lastPatient',
    JSON.stringify({ id: patient.id_patient, name: `${patient.nom_patient} ${patient.prenom_patient}` }));
}, [patient]);
  

  if (loading) return <Loading  />;
  if (error)   return <ErrorPage error={error} />;
  if (!patient) return null;

  

  return (
    <div className="bg-paper min-h-screen p-8 text-ink">
      
      <Header patient={patient} activeTab={activeTab} setActiveTab={setActiveTab} formatDate={formatDate} onPatientUpdated={refreshPatient} />
      {activeTab === 'profil'  && <ProfilTab patient={patient} onGoToDossier={() => setActiveTab('dossier')} onSummarized={refreshPatient}/>}
      {activeTab === 'dossier' && <DossierTab />}
      {activeTab === 'rdv'     && <RdvTab patientId={id} patientName={patient.nom_patient,patient.prenom_patient} />}
    </div>
  );
};

export default PatientProfile;