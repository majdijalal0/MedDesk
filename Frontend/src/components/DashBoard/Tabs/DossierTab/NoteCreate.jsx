import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createNote, organizeNote , deleteNote , NOTE_TYPES, validateNote } from '../../../../services/noteServices';

const NoteCreate = ({ patientId, onSaved }) => {
  const [rawText, setRawText] = useState('');
  const [type, setType] = useState(NOTE_TYPES[0]);
  const [noteId, setNoteId] = useState(null);
  const [structured, setStructured] = useState(null);
  const [editing, setEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const reset = () => {
    setRawText(''); setType(NOTE_TYPES[0]); setStructured(null); setEditing(false); setMsg('');
  };

  const handleOrganize = async () => {
    setAiLoading(true); setMsg('');
    const res = await organizeNote(patientId,rawText,type);
    setAiLoading(false);
    if (res.error) return setMsg(res.error);
    const note = res.note ?? res.newNote;         
    setNoteId(note.id_note);
    setStructured(note.contenu_structure); 
  };



  const handleSaveAsIs = async () => {          
    setSaving(true); setMsg('');
    const res = await createNote(patientId, { patientId : patientId , contenu_brut: rawText, type, statut: 'validé' });
    setSaving(false);
    if (res.error) return setMsg(res.error);
    setMsg('Note enregistrée.'); reset(); onSaved?.();
  };

  const handleValidate = async () => {          
    setSaving(true); setMsg('');
    const res = await validateNote(noteId, structured);
    setSaving(false);
    if (res.error) return setMsg(res.error);
    setMsg('Note validée.'); reset(); onSaved?.();
  };

  const handleReject = async () => {
    setSaving(true); setMsg('');
    const res = await deleteNote(noteId);
    setSaving(false);
    if (res.error) return setMsg(res.error);
    setNoteId(null); setStructured(null); setEditing(false);         
  };

  return (
    <section className="bg-white rounded-lg border border-gray/30 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-gray text-xs uppercase tracking-wide">Note brute</label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
            placeholder="Rédigez la note du médecin..."
            className={`mt-1 w-full rounded-lg border p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal ${
              aiLoading ? 'ring-2 ring-amber border-amber' : 'border-gray/40'
            }`}
          />
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-gray/40 px-3 py-2 text-sm text-ink">
              {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {!structured && (
              <button onClick={handleOrganize} disabled={!rawText.trim() || aiLoading}
                className="px-4 py-2 rounded-lg bg-amber text-white cursor-pointer text-sm font-semibold disabled:opacity-40">
                Organiser avec l'IA
              </button>
            )}
            <button onClick={handleSaveAsIs} disabled={!rawText.trim() || saving}
              className="px-4 py-2 rounded-lg bg-teal text-white cursor-pointer text-sm font-semibold disabled:opacity-40">
              Enregistrer la note
            </button>
          </div>
        </div>

        <div className={`rounded-lg border p-3 ${structured ? 'border-amber' : 'border-dashed border-gray/40'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray text-xs uppercase tracking-wide">Note structurée</span>
            {structured && <span className="text-xs px-2 py-0.5 rounded bg-amber/10 text-amber">Non validé</span>}
          </div>

          {aiLoading ? (
            <div className="flex items-center justify-center gap-2 text-amber text-sm py-8">
              <Loader2 className="w-4 h-4 animate-spin" /> Extraction en cours...
            </div>
          ) : structured ? (
            <>
              {editing ? (
                <textarea value={structured} onChange={(e) => setStructured(e.target.value)} rows={9}
                  className="w-full rounded-lg border border-gray/40 p-2 text-sm text-ink" />
              ) : (
                <p className="text-ink/80 text-sm whitespace-pre-line">{structured}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={handleValidate} disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-teal text-white cursor-pointer text-sm font-semibold disabled:opacity-40">
                  Valider
                </button>
                <button onClick={() => setEditing((e) => !e)}
                  className="px-3 py-1.5 rounded-lg border border-gray/40 text-ink text-sm">
                  {editing ? 'Terminer' : 'Éditer'}
                </button>
                <button onClick={handleReject}
                  className="px-3 py-1.5 rounded-lg border border-gray/40 text-gray text-sm">
                  Rejeter
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray text-sm italic py-8 text-center">
              Organiser la note pour voir la version structurée
            </p>
          )}
        </div>
      </div>
      {msg && <p className="text-sm mt-3 text-teal">{msg}</p>}
    </section>
  );
};

export default NoteCreate;