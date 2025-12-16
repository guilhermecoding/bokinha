'use client';

import dynamic from 'next/dynamic';

const RegressiveTimerClient = dynamic(
    () => import('./components/RegressiveTimerClient'),
    { ssr: false }
);

export default function RegressiveTimer({
    startDate
}: {
    startDate: Date
}) {
    return <RegressiveTimerClient startDate={startDate} />;
}