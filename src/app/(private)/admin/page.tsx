'use client';

import Page from '@/components/Page';
import Section from '@/components/Section';
import BoxContest from './_components/BoxContest';

export default function AdminPage() {
    return (
        <Page className='gap-3'>
            <Section className='flex justify-center'>
                <h1 className='text-6xl font-bold text-muted-foreground'>BOKINHA</h1>
            </Section>

            <Section>
                <BoxContest />
            </Section>
            
        </Page>
    );
}