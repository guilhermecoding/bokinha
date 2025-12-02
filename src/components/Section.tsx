import { twMerge } from 'tailwind-merge';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}

/**
 * Componente 'section' que envolve o conteúdo principal da página.
 * @param children - O conteúdo a ser renderizado dentro do componente Page.
 * @returns 
 */
export default function Section({ children, className, ...props }: SectionProps) {
    return <section className={twMerge('w-4/5', className)} {...props}>
        {children}
    </section>;
}