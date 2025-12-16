export default function Footer() {
  return (
    <footer className='w-full my-6 flex justify-center'>
        <span className='text-sm text-muted-foreground'>Desenvolvido por <strong>João Guilherme</strong> &copy; {new Date().getFullYear()} - v2.0.0</span>
    </footer>
  );
}
