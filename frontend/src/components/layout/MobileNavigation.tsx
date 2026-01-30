'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Menu,
  X,
  Users,
  Target
} from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/agents', icon: Bot, label: 'Agents' },
  { href: '/relationships', icon: Users, label: 'Relationships' },
  { href: '/outreach', icon: Target, label: 'Marketing Outreach' },
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

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-wizard-emerald hover:text-wizard-emerald-800 hover:bg-wizard-cream-100 dark:hover:bg-wizard-dark-bg-tertiary rounded-lg"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 left-0 h-full w-80 bg-wizard-emerald shadow-2xl z-50 p-4"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              {/* Logo/Title */}
              <div className="flex items-center gap-3 mb-8 mt-2">
                <div className="w-10 h-10 bg-wizard-gold rounded-lg flex items-center justify-center">
                  <Sparkles className="text-wizard-emerald" size={24} />
                </div>
                <div className="text-xl font-bold text-wizard-gold">Dashboard Daddy</div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1 flex-1">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-wizard-gold text-wizard-emerald-900 shadow-md font-medium' 
                            : 'text-wizard-gold hover:bg-wizard-emerald-700 hover:text-wizard-cream'
                        }`}
                      >
                        <item.icon size={20} />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="mt-auto pt-6 border-t border-wizard-emerald-600">
                <div className="text-xs text-wizard-gold opacity-60 text-center">
                  Wizard of AI Dashboard
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}