'use client';

import AuthProvider from './auth-provider';
import { TanStackProvider } from './tanstack-provider';

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
        <AuthProvider>
            <TanStackProvider>
                {children}
            </TanStackProvider>
        </AuthProvider>
    );
}