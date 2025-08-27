export const fmtRange = (startISO: string, endISO: string) => {
  try {
    const s = new Date(startISO);
    const e = new Date(endISO);
    const d = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const t = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${d.format(s)} • ${t.format(s)} – ${t.format(e)}`;
  } catch {
    return `${startISO} – ${endISO}`;
  }
};

export const debounce = <T extends (...a: any[]) => void>(fn: T, ms = 300) => {
  let h: any;
  return (...a: any[]) => {
    clearTimeout(h);
    h = setTimeout(() => fn(...a), ms);
  };
};

export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const fmtHHmm = (isoOrDate: string | Date) => {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
