import Page from '@/components/Page';
import { getContest } from './layout';
import Section from '@/components/Section';
import BoxContainer from '@/components/BoxContainer';
import TimeContest from './_components/TimeContest';
import messageHour from '@/lib/message-hour';
import ContainerQuestions from './_components/ContainerQuestions';
import ContainerScoreboard from './_components/ContainerScoreboard';

export default async function ContestPage({
    params
}:{
    params: Promise<{ slug_contest: string }>
}) {
    const { slug_contest } =  await params;

    const contest = await getContest(slug_contest);

    return (
        <Page className='gap-3'>
            <Section>
                <BoxContainer className='flex justify-between items-center rounded-3xl'>
                    <div>
                        <h1 className='font-medium text-3xl'>{messageHour(new Date().getHours())}, João!</h1>
                        <h3 className='text-xl text-muted-foreground'>{contest?.name}</h3>
                    </div>

                    <TimeContest startTime={contest?.startTime} endTime={contest?.endTime} />
                </BoxContainer>
            </Section>
            <Section className='flex gap-3'>
                <div className='min-w-9/12'>
                    <ContainerQuestions contestId={contest?.id} />
                </div>
                <div className='w-full'>
                    <ContainerScoreboard contestId={contest?.id} />   
                </div>
            </Section>
        </Page>
    );
}