import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingBag, 
  Settings, 
  Truck, 
  Wallet, 
  ShieldCheck, 
  Receipt, 
  Package, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { BRANCH_NAMES, type Branch } from '@/lib/blink';
import { Button } from '@/components/ui/button';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {
  const { branch, logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'پیش‌خوان', icon: LayoutDashboard, branches: ['all'] },
    { id: 'admin', label: 'مدیریت اداری', icon: FileText, branches: ['admin', 'super_admin'] },
    { id: 'procurement', label: 'مدیریت تدارکات', icon: ShoppingBag, branches: ['procurement', 'super_admin'] },
    { id: 'assets', label: 'محاسبه اجناس', icon: Package, branches: ['assets', 'super_admin'] },
    { id: 'transport', label: 'ترانسپورت', icon: Truck, branches: ['transport', 'super_admin'] },
    { id: 'finance', label: 'مدیریت مالی', icon: Wallet, branches: ['finance', 'super_admin'] },
    { id: 'control', label: 'مدیریت کنترول', icon: ShieldCheck, branches: ['control', 'super_admin'] },
    { id: 'invoice', label: 'شعبه انوایس', icon: Receipt, branches: ['invoice', 'super_admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.branches.includes('all') || (branch && item.branches.includes(branch))
  );

  return (
    <div className={cn("flex flex-col h-screen border-l bg-card/50 backdrop-blur-xl", className)}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-lg">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">پنل قوش‌تپه</h1>
            <p className="text-xs text-muted-foreground">سامانه اداری و مالی</p>
          </div>
        </div>

        <nav className="space-y-1">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold text-xs">
            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.displayName || 'کاربر'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{branch ? BRANCH_NAMES[branch] : 'بدون نقش'}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
          onClick={logout}
        >
          <LogOut size={20} className="ml-3" />
          <span>خروج از سیستم</span>
        </Button>
      </div>
    </div>
  );
}
