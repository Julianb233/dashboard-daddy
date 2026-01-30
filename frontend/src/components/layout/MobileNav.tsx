'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Bot, 
  ListTodo, 
  Settings, 
  Terminal, 
  Kanban, 
  MessageSquare, 
  Search,
  Shield,
  FileText,
  DollarSign,
  Sparkles,
  Users,
  Menu,
  X,
  ChevronRight,
  Phone,
  Target
} from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/agents', icon: Bot, label: 'Agents' },
  { href: '/relationships', icon: Users, label: 'Relationships' },
  { href: '/outreach', icon: Target, label: 'Marketing Outreach' },
  { href: '/caller', icon: Phone, label: 'AI Caller' },
  { href: '/messaging', icon: MessageSquare, label: 'Messaging' },
  { href: '/memory', icon: Search, label: 'Memory Search' },
  { href: '/kanban', icon: Kanban, label: 'Kanban' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/terminal', icon: Terminal, label: 'Terminal' },
  { href: '/approvals', icon: Shield, label: 'Approvals' },
  { href: '/audit', icon: FileText, label: 'Audit Log' },
  { href: '/usage', icon: DollarSign, label: 'Usage & Costs' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-wizard-emerald border-b border-wizard-emerald-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-wizard-gold rounded-lg flex items-center justify-center">
            <Sparkles className="text-wizard-emerald" size={18} />
          </div>
          <span className="text-wizard-gold font-bold">Dashboard Daddy</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-wizard-gold hover:bg-wizard-emerald-700 rounded-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 bg-wizard-emerald transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-wizard-emerald-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-wizard-gold rounded-lg flex items-center justify-center">
              <Sparkles className="text-wizard-emerald" size={18} />
            </div>
            <span className="text-wizard-gold font-bold">Menu</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-wizard-gold hover:bg-wizard-emerald-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-wizard-gold text-wizard-emerald-900 font-medium' 
                    : 'text-wizard-gold hover:bg-wizard-emerald-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={16} className="opacity-50" />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Spacer for fixed header */}
      <div className="lg:hidden h-14" />
    </>
  );
}

// Bottom navigation for quick access on mobile
export function MobileBottomNav() {
  const pathname = usePathname();
  
  const quickItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/relationships', icon: Users, label: 'People' },
    { href: '/kanban', icon: Kanban, label: 'Kanban' },
    { href: '/agents', icon: Bot, label: 'Agents' },
    { href: '/settings', icon: Settings, label: 'More' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-wizard-emerald border-t border-wizard-emerald-600 z-40 px-2 py-1 safe-area-bottom">
      <div className="flex justify-around items-center">
        {quickItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                isActive 
                  ? 'text-wizard-gold' 
                  : 'text-wizard-gold/60 hover:text-wizard-gold'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
