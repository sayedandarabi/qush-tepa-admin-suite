import React, { useState, useEffect } from 'react';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, ShoppingBag, FileCheck, User, DollarSign, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ProcurementModule() {
  const [activeSubTab, setActiveSubTab] = useState('proposals');

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">مدیریت تدارکات</h2>
          <p className="text-muted-foreground mt-1">پروسه نرخ‌گیری، عقد قرارداد و پیگیری خرید</p>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="proposals" className="rounded-xl h-12 px-8 data-[state=active]:bg-primary data-[state=active]:text-white">
            <ShoppingBag size={18} className="ml-2" />
            پیشنهادات واصله
          </TabsTrigger>
          <TabsTrigger value="contracts" className="rounded-xl h-12 px-8 data-[state=active]:bg-primary data-[state=active]:text-white">
            <FileCheck size={18} className="ml-2" />
            قراردادها و خریداری‌ها
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals">
          <ProcurementProposals />
        </TabsContent>
        <TabsContent value="contracts">
          <ContractsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProcurementProposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      // Fetch proposals targeted at procurement
      const data = await blink.db.proposals.list({
        where: { targetBranch: 'procurement' },
        orderBy: { createdAt: 'desc' }
      });
      setProposals(data);
    } catch (error) {
      toast.error('خطا در بارگذاری پیشنهادات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleCreateProcurement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProposal) return;
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      setIsSubmitting(true);
      await blink.db.procurements.create({
        proposalId: selectedProposal.id,
        pricingNumber: data.pricingNumber,
        isQuoted: data.isQuoted === 'on' ? 1 : 0,
        isContracted: data.isContracted === 'on' ? 1 : 0,
        companyName: data.companyName,
        grossAmount: Number(data.grossAmount),
        branchId: 'procurement',
        userId: user.id
      });
      
      toast.success('مراحل تدارکاتی با موفقیت ثبت شد');
      setSelectedProposal(null);
      fetchProposals();
    } catch (error) {
      toast.error('خطا در ثبت اطلاعات تدارکات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {selectedProposal && (
        <Card className="rounded-[32px] overflow-hidden border-2 border-primary/10 shadow-xl animate-fade-in mb-8">
          <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <ShoppingBag className="text-primary" />
              تکمیل مراحل تدارکاتی برای پیشنهاد: {selectedProposal.number}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleCreateProcurement} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>شماره درخواست نرخ‌گیری</Label>
                <Input name="pricingNumber" required placeholder="مثلاً: Q-123" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>نام شرکت / شخص طرف قرارداد</Label>
                <Input name="companyName" required placeholder="نام طرف معامله" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>مبلغ ناخالص قرارداد (افغانی)</Label>
                <Input name="grossAmount" type="number" required placeholder="مبلغ نهایی" className="rounded-xl" />
              </div>
              <div className="flex items-center gap-8 px-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isQuoted" id="isQuoted" className="w-5 h-5 accent-primary" />
                  <Label htmlFor="isQuoted">کوتیشن شده؟</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isContracted" id="isContracted" className="w-5 h-5 accent-primary" />
                  <Label htmlFor="isContracted">قرارداد شده؟ (آمر خریداری)</Label>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedProposal(null)} className="rounded-xl px-8">انصراف</Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 gradient-bg shadow-lg shadow-primary/20">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'ثبت نهایی تدارکات'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[32px] border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">نمبر پیشنهاد</TableHead>
              <TableHead className="text-right">موضوع</TableHead>
              <TableHead className="text-right">قیمت تخمینی</TableHead>
              <TableHead className="text-right">متقاضی</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : proposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  هیچ پیشنهادی جهت طی مراحل تدارکاتی یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              proposals.map((prop) => (
                <TableRow key={prop.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{prop.number}</TableCell>
                  <TableCell className="max-w-xs truncate">{prop.subject}</TableCell>
                  <TableCell>{Number(prop.estimatedPrice).toLocaleString()} افغانی</TableCell>
                  <TableCell>{prop.requestingBranch}</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedProposal(prop)}
                      className="rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                    >
                      طی مراحل تدارکات
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function ContractsManager() {
  const [procurements, setProcurements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProcurements = async () => {
    try {
      setIsLoading(true);
      const data = await blink.db.procurements.list({
        orderBy: { createdAt: 'desc' }
      });
      setProcurements(data);
    } catch (error) {
      toast.error('خطا در بارگذاری لیست تدارکات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurements();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="rounded-[32px] border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">شماره نرخ‌گیری</TableHead>
              <TableHead className="text-right">شرکت / شخص</TableHead>
              <TableHead className="text-right">مبلغ قرارداد</TableHead>
              <TableHead className="text-center">کوتیشن</TableHead>
              <TableHead className="text-center">قرارداد</TableHead>
              <TableHead className="text-right">وضعیت انوایس</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : procurements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  هیچ قرارداد یا خریداری ثبت نشده است.
                </TableCell>
              </TableRow>
            ) : (
              procurements.map((proc) => (
                <TableRow key={proc.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{proc.pricingNumber}</TableCell>
                  <TableCell>{proc.companyName}</TableCell>
                  <TableCell>{Number(proc.grossAmount).toLocaleString()} افغانی</TableCell>
                  <TableCell className="text-center">
                    {Number(proc.isQuoted) > 0 ? <CheckCircle2 className="mx-auto text-green-500" size={18} /> : <XCircle className="mx-auto text-muted-foreground" size={18} />}
                  </TableCell>
                  <TableCell className="text-center">
                    {Number(proc.isContracted) > 0 ? <CheckCircle2 className="mx-auto text-green-500" size={18} /> : <XCircle className="mx-auto text-muted-foreground" size={18} />}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold border",
                      Number(proc.hasInvoice) > 0 
                        ? "bg-green-500/10 text-green-600 border-green-500/20" 
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )}>
                      {Number(proc.hasInvoice) > 0 ? 'انوایس دریافت شده' : 'در انتظار انوایس'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
