import { useEffect, useState } from 'react';
import { X, Edit } from 'lucide-react';
import { formatDate } from '../../../../utils/format';  
import { updateNote } from '../../../../services/noteServices';

const NoteModal = ({ selectedNote, onClose, onSaved }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [currentContent, setCurrentContent] = useState('');  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    setIsEditing(false);
    setError('');
    const content = selectedNote.contenu_structure || selectedNote.contenu_brut || '';
    setEditedContent(content);
    setCurrentContent(content); 
  }, [selectedNote]);

  const startEditing = () => {
    setEditedContent(currentContent);
    setIsEditing(true);
    setError('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
  };

  const handleUpdate = async () => {
    if (!editedContent.trim()) {
      setError('Le contenu ne peut pas être vide');
      return;
    }
    setSaving(true);
    setError('');
    const payload = selectedNote.contenu_structure
    ? { contenu_structure: editedContent }  
    : { contenu_brut: editedContent };
    const res = await updateNote(selectedNote.id_note, payload);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setCurrentContent(editedContent);
    setIsEditing(false);
    onSaved?.();  
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        className="bg-paper rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray/30 sticky top-0 bg-paper">
          <div className="flex items-center gap-3">
            <span className="data-value text-gray text-sm">{formatDate(selectedNote.date_creation)}</span>
            <span className="text-ink text-sm font-medium">{selectedNote.type}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              selectedNote.statut === 'validé' ? 'bg-teal/10 text-teal' : 'bg-amber/10 text-amber'
            }`}>
              {selectedNote.statut}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={startEditing}
                className="p-1.5 rounded-lg text-gray hover:text-ink hover:bg-gray/10 transition-colors"
                title="Modifier"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="text-gray hover:text-ink" aria-label="Fermer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={15}
                className="w-full rounded-lg border border-gray/40 p-3 text-sm text-ink whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal"
                disabled={saving}
              />
              {error && <p className="text-red text-sm">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-gray/40 text-ink text-sm disabled:opacity-40"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-teal text-white text-sm font-semibold disabled:opacity-40"
                >
                  {saving ? 'Enregistrement…' : 'Valider'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-ink text-sm whitespace-pre-line">{currentContent || '—'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteModal;