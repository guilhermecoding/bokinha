import Logo from '@/components/Logo';

export default function HeaderParticipant() {
  return (
    <header className='w-full py-5 flex justify-center'>
        <div className='w-11/12 sm:w-4/5 flex items-center justify-start'>
            <Logo />
        </div>
    </header>
  );
}
