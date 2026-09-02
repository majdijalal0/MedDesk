import { useState ,  useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NotesHistory from "./NotesHistory";
import NoteCreate from "./NoteCreate";
import { getNotes } from '../../../../services/noteServices';



const DossierTab = () => {
  const {id} = useParams();

  const [patientNotes , setPatientNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error , setError] = useState('');
  

    const loadNotes = async () => {
      const response = await getNotes(id);
      console.log('refetch notes');                
      if (!response) setError('Aucune réponse du serveur');
      else if (response.error) setError(response.error);
      else setPatientNotes(response);
      setLoading(false);
    };

    useEffect(() => { loadNotes(); }, [id]); 

  return (
    <div className="mt-6 space-y-6">

      <section className="bg-white rounded-lg border border-gray/30 p-4">
        <NoteCreate  patientId={id} onSaved={loadNotes}/>
      </section>

       <NotesHistory patientId={id} loadNotes={loadNotes} patientNotes={patientNotes} loading={loading} error={error}  />
     
    </div>
  );
};

export default DossierTab;