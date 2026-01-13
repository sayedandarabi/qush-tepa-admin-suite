import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { LayoutDashboard, FileText, ShoppingBag, Package, Truck, Wallet, ShieldCheck, Receipt, Settings, Loader2 } from 'lucide-react';
import { AdminModule } from '@/features/admin/admin-module';
import { ProcurementModule } from '@/features/procurement/procurement-module';
import { InvoiceModule } from '@/features/invoice/invoice-module';
import { ControlModule } from '@/features/control/control-module';
import { AssetsModule } from '@/features/assets/assets-module';
import { blink } from '@/lib/blink';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState({
    letters: 0,
    proposals: 0,
    procurements: 0,
    invoices: 0,
    assets: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [l, p, pr, inv, ass] = await Promise.all([
          blink.db.letters.count(),
          blink.db.proposals.count(),
          blink.db.procurements.count(),
          blink.db.invoices.count(),
          blink.db.assets.count()
        ]);
        setStats({
          letters: l,
          proposals: p,
          procurements: pr,
          invoices: inv,
          assets: ass
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'مکتوب‌ها', value: stats.letters, color: '#6366f1' },
    { name: 'پیشنهادات', value: stats.proposals, color: '#a855f7' },
    { name: 'تدارکات', value: stats.procurements, color: '#ec4899' },
    { name: 'انوایس‌ها', value: stats.invoices, color: '#f43f5e' },
    { name: 'فورم م-۷', value: stats.assets, color: '#f59e0b' },
  ];

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">وضعیت عمومی پروژه قوش تپه</h2>
          <p className="text-muted-foreground mt-1">مانیتورینگ ریل‌تایم تمام شعبات و اسناد مالی</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'کل مکتوب‌ها', value: stats.letters, icon: FileText, color: 'bg-blue-500' },
          { label: 'کل پیشنهادات', value: stats.proposals, icon: ShoppingBag, color: 'bg-purple-500' },
          { label: 'انوایس‌های جاری', value: stats.invoices, icon: Receipt, color: 'bg-pink-500' },
          { label: 'فورم‌های صادر شده', value: stats.assets, icon: Package, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-3xl border shadow-sm hover:shadow-lg transition-all group border-primary/5">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <span className="text-3xl font-black">{stat.value}</span>
            </div>
            <p className="text-muted-foreground text-sm font-bold">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-8 rounded-[40px] border shadow-sm h-[450px] border-primary/5">
          <h3 className="font-bold text-lg mb-8">توزیع اسناد بر اساس نوع</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-8 rounded-[40px] border shadow-sm h-[450px] border-primary/5 overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg mb-8">وضعیت تدارکاتی</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-bold text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MainContent() {
  const { user, isLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">در حال بارگذاری سامانه...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />
        
        <div className="glass p-12 rounded-[40px] shadow-2xl w-full max-w-md text-center space-y-8 relative z-10 animate-fade-in border-white/20">
          <div className="w-20 h-20 gradient-bg rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl transform hover:rotate-12 transition-transform duration-500">
            <ShoppingBag size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight gradient-text">قوش تپه</h1>
            <p className="text-muted-foreground font-medium">سامانه جامع مدیریت مالی و اداری</p>
          </div>
          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold gradient-bg hover:opacity-90 shadow-xl shadow-primary/20 transition-all active:scale-95"
            onClick={login}
          >
            ورود به سیستم
          </Button>
          <p className="text-xs text-muted-foreground">جهت دسترسی به پنل، از حساب کاربری سازمانی استفاده کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fdfaff] dark:bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} className="w-72 hidden lg:flex" />
      
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-20 glass h-20 px-8 flex items-center justify-between border-b lg:border-transparent">
          <div className="flex items-center gap-4 lg:hidden">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
            <h1 className="font-bold">قوش تپه</h1>
          </div>
          
          <div className="flex-1 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md hidden md:block">
              <input 
                type="text" 
                placeholder="جستجوی اسناد، شماره مکتوب..." 
                className="w-full h-11 bg-muted/50 border-none rounded-2xl px-12 text-sm focus:ring-2 ring-primary/20 transition-all"
              />
              <FileText size={18} className="absolute right-4 top-3 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-left hidden sm:block">
              <p className="text-xs text-muted-foreground">امروز</p>
              <p className="text-sm font-bold">۲۳ جدی ۱۴۰۲</p>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'admin' && <AdminModule />}
          {activeTab === 'procurement' && <ProcurementModule />}
          {activeTab === 'assets' && <AssetsModule />}
          {activeTab === 'control' && <ControlModule />}
          {activeTab === 'invoice' && <InvoiceModule />}
          
          {['transport', 'finance'].includes(activeTab) && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
              <Settings size={48} className="mb-4 opacity-20 animate-spin-slow" />
              <p className="text-lg font-medium">در حال پیاده‌سازی بخش {activeTab}...</p>
            </div>
          )}
        </div>
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}