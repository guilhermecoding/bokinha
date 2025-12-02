import Page from '@/components/Page';

export default async function ContestPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    return (
      <Page>
        <h1>Competição: {slug}</h1>
      </Page>
    );
}