'use client';

import { useEffect, useState } from 'react';

export default function TimeContest({
    startTime,
    endTime
}: {
    startTime?: Date;
    endTime?: Date;
}) {
  // não inicializar com `new Date()` para evitar mismatch — começa como null no server e no client
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // montar o relógio apenas no cliente
    const initTimeout = setTimeout(() => setNow(new Date()), 0);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(initTimeout);
      clearInterval(t);
    };
  }, []);

  function toDate(d?: Date) {
    if (!d) return null;
    return d instanceof Date ? d : new Date(d);
  }

  function formatDuration(ms: number) {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    if (days > 0) return `${days}d ${hh}:${mm}:${ss}`;
    return `${hh}:${mm}:${ss}`;
  }

  const s = toDate(startTime);
  const e = toDate(endTime);

  // só calcular/mostrar o cronômetro quando `now` estiver definido (ou seja, no cliente após mount)
  let statusLabel = null;
  if (!s || !e || !now) {
    statusLabel = null;
  } else {
    const nowMs = now.getTime();
    const startMs = s.getTime();
    const endMs = e.getTime();

    if (nowMs < startMs) {
      statusLabel = (
        <div className="text-sm text-gray-700">
          <div>Começa em</div>
          <div className="font-mono text-lg font-bold">-{formatDuration(startMs - nowMs)}</div>
        </div>
      );
    } else if (nowMs >= startMs && nowMs < endMs) {
      statusLabel = (
        <div className="text-sm text-gray-700">
          <div>Tempo restante</div>
          <div className="font-mono text-lg font-bold">{formatDuration(endMs - nowMs)}</div>
        </div>
      );
    } else {
      statusLabel = (
        <div className="text-sm text-red-600 font-semibold">Competição Finalizada</div>
      );
    }
  }

  return (
    <div>
        {statusLabel && (
            <div className='text-sm text-gray-600 text-right'>
                {statusLabel}
            </div>
        )}
    </div>
  );
}
