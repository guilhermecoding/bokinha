import Logo from './Logo';
import Nav from './Navs/Nav';

export default function Header() {
    return (
        <header className='w-full py-5 flex justify-center'>
            <div className='w-11/12 sm:w-4/5 flex items-center justify-start'>
                <Logo />

                <div className='w-full flex justify-end'>
                    <Nav />
                </div>
            </div>
        </header>
    );
}