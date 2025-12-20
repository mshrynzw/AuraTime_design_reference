'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  Clock,
  Calendar,
  FileText,
  CheckSquare,
  Users,
  Settings,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    title: 'ダッシュボード',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: '打刻',
    href: '/time-clock',
    icon: Clock,
  },
  {
    title: '勤怠一覧',
    href: '/attendance',
    icon: Calendar,
  },
  {
    title: '休暇申請',
    href: '/leave-requests',
    icon: FileText,
  },
  {
    title: '給与明細',
    href: '/payroll',
    icon: BarChart3,
  },
  {
    title: '承認待ち',
    href: '/approvals',
    icon: CheckSquare,
    roles: ['manager', 'admin', 'system_admin'],
  },
  {
    title: 'シフト管理',
    href: '/shifts',
    icon: Calendar,
    roles: ['manager', 'admin', 'system_admin'],
  },
  {
    title: 'マスタ管理',
    href: '/master',
    icon: Settings,
    roles: ['admin', 'system_admin'],
  },
  {
    title: '給与期間管理',
    href: '/payroll-periods',
    icon: Calendar,
    roles: ['admin', 'system_admin'],
  },
  {
    title: '従業員管理',
    href: '/employees',
    icon: Users,
    roles: ['admin', 'system_admin'],
  },
  {
    title: '監査ログ',
    href: '/audit-logs',
    icon: AlertCircle,
    roles: ['system_admin'],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return profile?.role && item.roles.includes(profile.role);
  });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full py-4">
          <nav className="flex flex-col gap-1 px-3">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
