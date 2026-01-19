'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'D' },
  { name: 'Agents', href: '/agents', icon: 'A' },
  { name: 'Tasks', href: '/tasks', icon: 'T' },
  { name: 'Settings', href: '/settings', icon: 'S' },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2 flex-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={"flex items-center gap-3 px-4 py-3 rounded-lg transition-colors " + (
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            <span className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-md text-sm font-bold">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
