import { twMerge } from 'tailwind-merge';

export default function BoxContainer({
    children,
    className
}: {
    children: React.ReactNode;
    className?: React.HTMLAttributes<HTMLDivElement>['className'];
}) {
  return (
    <div className={`${twMerge('bg-white p-6 border border-muted-foreground rounded-md', className)}`}>
        {children}
    </div>
  );
}
