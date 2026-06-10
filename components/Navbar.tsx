'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Bell, LogOut, User, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (!confirmLogout) return;
    const timer = setTimeout(() => {
      setConfirmLogout(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [confirmLogout]);

  const handleLogout = async () => {
    if (confirmLogout) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    } else {
      setConfirmLogout(true);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-2 py-2">
          {/* Logo */}
          <Link href="/">
            <div className="flex cursor-pointer items-center gap-2.5 group">
              <Logo className="w-8 h-8 rounded-lg group-hover:scale-105 transition-transform duration-200" />
              <div>
                <span className="font-bold text-brand-800 text-sm sm:text-base tracking-tight">dotko.in</span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 ml-2 font-medium">Admin Portal</span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <NavLink href="/" icon={<Home className="h-4 w-4" />} label="Dashboard" isActive={pathname === '/'} />
            <NavLink href="/users" icon={<Users className="h-4 w-4" />} label="Users" isActive={pathname.startsWith('/users')} />
            <NavLink href="/reports" icon={<FileText className="h-4 w-4" />} label="Reports" isActive={pathname.startsWith('/reports')} />
            <NavLink href="/notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" isActive={pathname.startsWith('/notifications')} />
            <NavLink href="/leads" icon={<UserPlus className="h-4 w-4" />} label="Leads" isActive={pathname.startsWith('/leads')} />

            {/* User Info & Logout */}
            {user && (
              <>
                <div className="ml-1 hidden items-center gap-2 rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-sm text-slate-600 lg:flex">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="max-w-52 truncate font-medium">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`ml-1 flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200 ${
                    confirmLogout
                      ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                  }`}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden text-sm font-medium md:block">
                    {confirmLogout ? 'Confirm Logout?' : 'Logout'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 md:px-4 ${
          isActive
            ? 'bg-brand-50 text-brand-800'
            : 'text-slate-600 hover:bg-slate-50 hover:text-brand-800'
        }`}
      >
        {icon}
        <span className="hidden md:block">{label}</span>
      </div>
    </Link>
  );
}
