import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatea fecha como DD/MM/YYYY
export const formatDate = (date) =>
  date ? format(new Date(date), 'dd/MM/yyyy', { locale: es }) : '—';

// Formatea fecha y hora como DD/MM/YYYY HH:mm
export const formatDateTime = (date) =>
  date ? format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es }) : '—';
