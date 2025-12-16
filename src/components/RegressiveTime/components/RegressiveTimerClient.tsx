'use client';

import Page from '../../Page';
import Section from '../../Section';
import RegressiveTimerContent from './RegressiveTimerContent';
import { useRouter } from 'next/navigation';

export default function RegressiveTimerClient({
    startDate
}: {
    startDate: Date
}) {
    const router = useRouter();

    return (
        <Page>
            <Section className='h-[80vh] flex flex-col justify-center items-center gap-8'>
                <h1 className='font-bold text-muted-foreground text-3xl'>
                    Iniciando em...
                </h1>

                <RegressiveTimerContent 
                    startDate={startDate}
                    onTimeExpired={() => router.refresh()}
                />
            </Section>
        </Page>
    );
}
