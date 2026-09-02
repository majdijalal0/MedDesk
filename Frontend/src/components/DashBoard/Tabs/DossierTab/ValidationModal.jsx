import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { validateNote } from '../../../../services/noteServices';

const ValidationModal = ({ note, onClose, onValidated }) => {
  const [content, setContent] = useState(note.contenu_structure || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => { document.body.classList.remove('overflow-hidden'); window.removeEventListener('keydown', k); };
  }, [onClose]);

  const handleValidate = async () => {
    if (!content.trim()) return setError('Le contenu ne peut pas être vide');
    setSaving(true);
    setError('');
    const res = await validateNote(note.id_note, content);
    setSaving(false);
    if (res.error) return setError(res.error);
    onValidated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray/30">
          <div>
            <h3 className="font-display text-lg text-ink">Valider la note structurée</h3>
            <p className="text-gray text-sm">Vérifiez et modifiez le contenu avant validation</p>
          </div>
          <button onClick={onClose} className="text-gray hover:text-ink" aria-label="Fermer"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full rounded-lg border border-gray/40 p-3 text-sm text-ink whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal"
          />
          {error && <p className="text-red text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray/30">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray/40 text-ink text-sm">Annuler</button>
          <button onClick={handleValidate} disabled={saving} className="px-4 py-2 rounded-lg bg-teal text-white text-sm font-semibold disabled:opacity-40">
            {saving ? 'Validation…' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ValidationModal;