import NavDesktop from './components/NavDesktop';
import NavMobile from './components/NavMobile';

export default function Nav() {
  return (
    <nav aria-label="Main navigation" className="flex items-center">
        {/* Nav para computador */}
        <div className='hidden md:block'>
            <NavDesktop />
        </div>

        {/* Nav para celulares e tablets */}
        <div className='block md:hidden'>
            <NavMobile />
        </div>
    </nav>
  );
}
