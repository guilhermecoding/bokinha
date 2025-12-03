import { twMerge } from 'tailwind-merge';

interface PageProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}

/**
 * Componente 'main' que envolve o conteúdo principal da página.
 * @param children - O conteúdo a ser renderizado dentro do componente Page.
 * @returns 
 */
export default function Page({ children, className, ...props }: PageProps) {
    return <main className={twMerge('w-full flex flex-col items-center', className)} {...props}>
        {children}
    </main>;
}