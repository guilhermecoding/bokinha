'use client';

import Page from '@/components/Page';
import Section from '@/components/Section';
import BoxContest from './_components/BoxContest';

export default function AdminPage() {
    return (
        <Page className='gap-3'>
            <Section>
                <BoxContest />
            </Section>
        </Page>
    );
}