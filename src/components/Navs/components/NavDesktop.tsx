'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import menus from '@/app/utils/menus';

export default function NavDesktop() {
  const pathname = usePathname() ?? '/';

  return (
    <ul className="flex gap-4">
      {menus.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`px-3 py-2 rounded-md text-lg font-medium ${
                isActive ? 'text-gray-900 hover:font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
