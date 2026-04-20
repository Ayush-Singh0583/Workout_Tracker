'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/workout',   label: 'Workout',   icon: '⊕' },
  { href: '/history',   label: 'History',   icon: '☰' },
  { href: '/progress',  label: 'Progress',  icon: '⟁' },
];

export function Sidebar() {
  const path = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-16 lg:w-52 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-zinc-800">
        <span className="text-amber-400 font-bold text-lg hidden lg:block">IronForge</span>
        <span className="text-amber-400 font-bold text-xl lg:hidden">IF</span>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {NAV.map((item) => {
          const active = path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <div className="hidden lg:block text-xs text-zinc-500 mb-2 truncate">
          {user?.email}
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-zinc-500 hover:text-red-400 transition-colors px-3 py-2"
        >
          <span className="lg:hidden">✕</span>
          <span className="hidden lg:block">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}