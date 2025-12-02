/**
 * Gerenciamento de providers globais da aplicação.
 * @param children - componentes filhos a serem renderizados dentro dos providers
 * @returns 
 */
export default function Providers({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}