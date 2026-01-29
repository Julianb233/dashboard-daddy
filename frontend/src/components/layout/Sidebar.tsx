'use client';

import Link from 'next/link';
import { Home, Bot, ListTodo, Settings, Terminal, Kanban, MessageSquare, Search } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/agents', icon: Bot, label: 'Agents' },
  { href: '/messaging', icon: MessageSquare, label: 'Messaging' },
  { href: '/memory', icon: Search, label: 'Memory Search' },
  { href: '/kanban', icon: Kanban, label: 'Kanban' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/terminal', icon: Terminal, label: 'Terminal' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen p-4">
      <div className="text-xl font-bold mb-8 text-blue-400">Dashboard Daddy</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
