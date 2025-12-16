import Header from '@/components/Header';

export default async function ContestLayout({
    children
}: {
    children: React.ReactNode;
}) {

    return (
        <>
            <Header />
            {children}
        </>
    );
}

