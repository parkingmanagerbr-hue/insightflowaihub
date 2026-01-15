import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  History,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { isAdmin, signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Gerar Relatório', path: '/dashboard/reports' },
    { icon: BarChart3, label: 'Power BI', path: '/dashboard/powerbi' },
    { icon: History, label: 'Histórico', path: '/dashboard/history' },
    { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
  ];

  const adminItems = [
    { icon: Users, label: 'Administração', path: '/dashboard/admin' },
  ];

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = location.pathname === item.path;

    return (
      <NavLink
        to={item.path}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-primary/10 hover:text-primary',
          isActive
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground'
        )}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap font-medium"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </NavLink>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Logo />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        {isAdmin && (
          <>
            <div className="my-4 border-t border-border" />
            {adminItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={signOut}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200',
            'hover:bg-destructive/10 hover:text-destructive text-muted-foreground'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap font-medium"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
