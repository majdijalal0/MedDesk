const parseDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

const toISOFormat = (isoString, includeTime = false) => {
  const d = parseDate(isoString);
  if (!d) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (!includeTime) return dateStr;
  return `${dateStr}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};


export const fmt = (iso, fallback = '—') => {
  const d = parseDate(iso);
  return d ? d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : fallback;
};

export const formatDate = (iso, fallback = null) => {
  const d = parseDate(iso);
  return d ? d.toLocaleDateString('fr-FR') : fallback;
};

export const fmtDate = (iso, fallback = '—') => {
  const d = parseDate(iso);
  return d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : fallback;
};

export const fmtTime = (iso, fallback = '—') => {
  const d = parseDate(iso);
  return d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : fallback;
};


export const getTodayString = () => toISOFormat(new Date(), false);

export const formatStringDate = (dateStr) => toISOFormat(dateStr, false);

export const toLocalInputValue = (isoString) => toISOFormat(isoString, true);

export const getInitialDateTime = () => {
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0); 
  return toISOFormat(now, true);
};


export const computeAge = (dob) => {
  const birth = parseDate(dob);
  if (!birth) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
};

export const SEXE_LABEL = { M: 'Homme', F: 'Femme' };

export const formatPatientId = (id) => `MA-${String(id ?? '').padStart(5, '0')}`;