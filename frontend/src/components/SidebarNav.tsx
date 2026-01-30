'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'D' },
  { name: 'Agent Army', href: '/agents/army', icon: '👑' },
  { name: 'Agents', href: '/agents', icon: 'A' },
  { name: 'Contacts', href: '/contacts', icon: '🧠' },
  { name: 'Tasks', href: '/tasks', icon: 'T' },
  { name: 'Activity Log', href: '/activity', icon: '📋' },
  { name: 'Approvals', href: '/approvals', icon: '✓' },
  { name: 'Terminal', href: '/terminal', icon: '>' },
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
                ? 'bg-wizard-gold text-wizard-dark font-semibold'
                : 'text-wizard-cream/80 hover:bg-wizard-medium/50 hover:text-wizard-cream'
            )}
          >
            <span className={"w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold " + (
              isActive ? 'bg-wizard-dark/30' : 'bg-wizard-dark/40'
            )}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
