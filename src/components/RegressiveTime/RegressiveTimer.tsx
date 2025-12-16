'use client';

import RegressiveTimerContent from './components/RegressiveTimerContent';
import { useRouter } from 'next/navigation';

export default function RegressiveTimer({
    startDate
}: {
    startDate: Date
}) {
    const router = useRouter();

    return (
        <RegressiveTimerContent 
            startDate={startDate}
            onTimeExpired={() => router.refresh()}
        />
    );
}
