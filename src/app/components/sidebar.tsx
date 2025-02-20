'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Users, 
  ListChecks,
  FileText,
  Send,
  LogOut,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Subscribers', href: '/dashboard/subscribers', icon: Users },
  { name: 'Lists', href: '/dashboard/lists', icon: ListChecks },
  { name: 'Templates', href: '/dashboard/templates', icon: FileText },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Send },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50/50">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Send className="h-6 w-6" />
          <h1 className="text-xl font-bold">Mailer</h1>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/sign-in"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Link>
      </div>
    </div>
  );
} 