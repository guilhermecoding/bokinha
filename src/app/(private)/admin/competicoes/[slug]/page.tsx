import Page from '@/components/Page';
import Section from '@/components/Section';
import BoxContestInfo from './_components/BoxContestInfo';
import BoxStudentsInfo from './_components/BoxStudentsInfo/BoxStudentsInfo';

export default function ContestPage({
  params,
}: {
  params: { slug: string }
}) {

    return (
      <Page>
        <Section className='flex flex-col lg:flex-row justify-between gap-5'>
          <BoxContestInfo />

          <BoxStudentsInfo />
        </Section>
      </Page>
    );
}