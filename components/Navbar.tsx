'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Bell, LogOut, User, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-2 py-2">
          {/* Logo */}
          <Link href="/">
            <div className="flex cursor-pointer items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">DOTKO.IN</h1>
                <span className="hidden text-xs text-slate-500 sm:block">Admin Portal</span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink href="/" icon={<Home className="h-4 w-4" />} label="Dashboard" isActive={pathname === '/'} />
            <NavLink href="/users" icon={<Users className="h-4 w-4" />} label="Users" isActive={pathname.startsWith('/users')} />
            <NavLink href="/reports" icon={<FileText className="h-4 w-4" />} label="Reports" isActive={pathname.startsWith('/reports')} />
            <NavLink href="/notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" isActive={pathname.startsWith('/notifications')} />
            <NavLink href="/leads" icon={<UserPlus className="h-4 w-4" />} label="Leads" isActive={pathname.startsWith('/leads')} />

            {/* User Info & Logout */}
            {user && (
              <>
                <div className="ml-1 hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 lg:flex">
                  <User className="h-4 w-4" />
                  <span className="max-w-52 truncate font-medium">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden text-sm font-medium md:block">Logout</span>
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
        className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:px-4 ${
          isActive
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        {icon}
        <span className="hidden md:block">{label}</span>
      </div>
    </Link>
  );
}
