import React, { useState, useEffect } from 'react';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Loader2, FileText, CheckCircle2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

export function AssetsModule() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchControlledInvoices = async () => {
    try {
      setIsLoading(true);
      // We need invoices that have been 'controlled'
      const controlData = await blink.db.controls.list({
        where: { status: 'controlled' }
      });
      
      const invoiceIds = controlData.map(c => c.invoiceId);
      if (invoiceIds.length === 0) {
        setInvoices([]);
        return;
      }

      const invoiceData = await blink.db.invoices.list({
        where: { id: { in: invoiceIds } },
        orderBy: { createdAt: 'desc' }
      });
      setInvoices(invoiceData);
    } catch (error) {
      toast.error('خطا در بارگذاری اطلاعات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchControlledInvoices();
  }, []);

  const handleCreateAssetRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      setIsSubmitting(true);
      await blink.db.assets.create({
        invoiceId: selectedInvoice.id,
        formM7Number: data.formM7Number,
        reportScan: data.reportScan || null,
        branchId: 'assets',
        userId: user.id
      });
      
      toast.success('فورم م-۷ با موفقیت ثبت و صادر شد');
      setSelectedInvoice(null);
      fetchControlledInvoices();
    } catch (error) {
      toast.error('خطا در ثبت اطلاعات جنسی');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">مدیریت محاسبه اجناس</h2>
          <p className="text-muted-foreground mt-1">ترتیب فورم م-۷، راپور رسید و اسکن اسناد جنسی</p>
        </div>
      </div>

      {selectedInvoice && (
        <Card className="rounded-[32px] overflow-hidden border-2 border-primary/10 shadow-xl animate-fade-in mb-8">
          <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <Package className="text-primary" />
              ترتیب فورم م-۷ برای انوایس: {selectedInvoice.registrationNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleCreateAssetRecord} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>نمبر فورم م-۷</Label>
                <Input name="formM7Number" required placeholder="مثلاً: ۷۸۹/م-۷" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>لینک اسکن راپور رسید / م-۷</Label>
                <div className="flex gap-2">
                  <Input name="reportScan" placeholder="https://..." className="rounded-xl flex-1" />
                  <Button type="button" variant="outline" className="rounded-xl shrink-0">
                    <UploadCloud size={18} />
                  </Button>
                </div>
              </div>
              <div className="md:col-span-2 p-4 bg-muted/30 rounded-2xl text-xs text-muted-foreground">
                <p>پس از ثبت، فورم م-۷ صادر شده و جهت کنترول نهایی به مدیریت مربوطه و سپس مدیریت مالی راجع می‌گردد.</p>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedInvoice(null)} className="rounded-xl px-8">انصراف</Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 gradient-bg shadow-lg shadow-primary/20">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'صادر کردن فورم م-۷'}
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
              <TableHead className="text-right">شماره انوایس</TableHead>
              <TableHead className="text-right">ساحه</TableHead>
              <TableHead className="text-right">وضعیت کنترول</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  هیچ انوایس کنترول شده‌ای جهت صدور م-۷ یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{inv.registrationNumber}</TableCell>
                  <TableCell>{inv.area}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 border border-green-500/20">
                      کنترول شده
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedInvoice(inv)}
                      className="rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                    >
                      <FileText size={18} className="ml-2" />
                      ترتیب فورم م-۷
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
