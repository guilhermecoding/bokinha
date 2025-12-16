/**
 * Retorna status do contest atual
 * @param start Timestamp de inicio
 * @param end Timestamp de encerramento
 * @returns Status do Contest
 */
export default function getContestStatus(start: Date, end: Date) {
  const now = new Date();

  if (now < start) return 'BEFORE';
  if (now > end) return 'FINISHED';
  return 'RUNNING';
}
