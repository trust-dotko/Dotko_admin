import Link from 'next/link';
import { Home, Users, FileText, Bell, BarChart3 } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">DOTKO.IN</h1>
              </div>
              <span className="ml-3 text-sm text-gray-500 hidden sm:block">Admin Portal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <NavLink href="/" icon={<Home className="w-4 h-4" />} label="Dashboard" />
            <NavLink href="/users" icon={<Users className="w-4 h-4" />} label="Users" />
            <NavLink href="/reports" icon={<FileText className="w-4 h-4" />} label="Reports" />
            <NavLink href="/notifications" icon={<Bell className="w-4 h-4" />} label="Notifications" />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
        {icon}
        <span className="text-sm font-medium hidden md:block">{label}</span>
      </div>
    </Link>
  );
}
