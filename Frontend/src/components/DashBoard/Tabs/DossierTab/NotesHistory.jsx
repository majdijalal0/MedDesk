import { CheckCircle, ChevronDown, ChevronUp , Loader2, Trash2, Wand2 } from 'lucide-react';
import NoteModal from './NoteModal';
import { useState } from 'react';
import { deleteNote, organizeSavedNote  } from '../../../../services/noteServices';
import ValidationModal from './ValidationModal';


const NotesHistory = ({patientNotes,loadNotes}) => {

    const [historyOpen,setHistoryOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [validationNote, setValidationNote] = useState(null);
    const [organizing, setOrganizing] = useState(null);  


    const handleNoteDelete = async (noteId) => {

    const res = await deleteNote(noteId);
    if (res.error) {
      console.error(res.error);
      return;
    }
    loadNotes();  

    
  };


    const handleOrganize = async (note) => {
        setOrganizing(note.id_note);  

      const res = await organizeSavedNote(note.id_note);

        setOrganizing(null);
        
      if (res.error) return console.error(res.error);
      loadNotes();  
      
      setValidationNote(res.newNote || res.note);
    };

    const handleValidate = (note) => {
      setValidationNote(note);
    };



  return (
    
    <div>
    <section className="bg-white rounded-lg border border-gray/30">
            <button
              onClick={() => setHistoryOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-ink text-sm font-semibold">
                Notes structurées précédentes
                <span className="data-value text-gray ml-2">({patientNotes.length})</span>
              </span>
              {historyOpen ? <ChevronUp className="w-4 h-4 text-gray" /> : <ChevronDown className="w-4 h-4 text-gray" />}
            </button>
    
            {historyOpen && (
    <ul className="max-h-64 overflow-y-auto divide-y divide-gray/20 border-t border-gray/20">
        {patientNotes.map((note) => (
          <li key={note.id_note} className="relative">
          <button
            onClick={() => setSelectedNote(note)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-paper transition-colors group"
          >
            <span className="flex items-center gap-3 text-sm">
              <span className="data-value text-gray">{new Date(note.date_creation).toLocaleDateString('fr-FR')}</span>
              <span className="text-ink font-medium">{note.type}</span>
            </span>

            <span className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${
                note.statut === 'validé' ? 'bg-teal/10 text-teal' : 'bg-amber/10 text-amber'
              }`}>
                {note.statut}
              </span>

            {!note.contenu_structure && (
              <button
                onClick={(e) => { e.stopPropagation(); handleOrganize(note); }}
                disabled={organizing === note.id_note}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                  organizing === note.id_note
                    ? 'text-amber/50 bg-amber/5 cursor-not-allowed'
                    : 'text-amber hover:bg-amber/10'
                }`}
                title={organizing === note.id_note ? 'Organisation en cours...' : 'Organiser avec l\'IA'}
              >
                {organizing === note.id_note ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">
                  {organizing === note.id_note ? 'Organisation...' : 'Organiser'}
                </span>
              </button>
            )}
          
          {note.contenu_structure && note.statut === 'en attente de validation' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleValidate(note); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-teal hover:bg-teal/10 transition-colors"
              title="Valider la note"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Valider</span>
            </button>
          )}
          
          <button onClick={(e) => { e.stopPropagation(); handleNoteDelete(note.id_note); }} className="...">
            <Trash2 className="w-4 h-4" />
          </button>
        </span>
            
              </button>
        </li>
      ))}
    </ul>
            )}
          </section>

          {validationNote && <ValidationModal note={validationNote} onClose={() => setValidationNote(null)} onValidated={loadNotes}/>}
    
          {selectedNote && <NoteModal selectedNote={selectedNote} onClose={() => setSelectedNote(null)} onSaved={loadNotes} />}
    </div>
  )
}

export default NotesHistory