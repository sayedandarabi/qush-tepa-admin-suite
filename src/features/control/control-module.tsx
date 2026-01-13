import React, { useState, useEffect } from 'react';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export function ControlModule() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoicesForControl = async () => {
    try {
      setIsLoading(true);
      // In a real app, we'd join with procurement. 
      // For MVP, we'll list invoices and show related info.
      const data = await blink.db.invoices.list({
        orderBy: { createdAt: 'desc' }
      });
      setInvoices(data);
    } catch (error) {
      toast.error('خطا در بارگذاری انوایس‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesForControl();
  }, []);

  const handleControlAction = async (status: 'controlled' | 'rejected', reason?: string) => {
    if (!selectedInvoice) return;
    
    try {
      setIsSubmitting(true);
      await blink.db.controls.create({
        invoiceId: selectedInvoice.id,
        status,
        rejectionReason: reason || null,
        branchId: 'control',
        userId: user.id
      });
      
      toast.success(status === 'controlled' ? 'اسناد با موفقیت کنترول شد' : 'اسناد مسترد گردید');
      setSelectedInvoice(null);
      fetchInvoicesForControl();
    } catch (error) {
      toast.error('خطا در ثبت عملیات کنترول');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">مدیریت کنترول</h2>
          <p className="text-muted-foreground mt-1">بررسی نهایی اسناد، تایید صحت و یا استرداد اسناد ناقص</p>
        </div>
      </div>

      {selectedInvoice && (
        <Card className="rounded-[32px] overflow-hidden border-2 border-primary/10 shadow-xl animate-fade-in mb-8">
          <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <ShieldCheck className="text-primary" />
              بررسی اسناد انوایس: {selectedInvoice.registrationNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-muted/30 rounded-2xl">
                <p className="text-muted-foreground mb-1">ساحه مربوطه</p>
                <p className="font-bold">{selectedInvoice.area}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl">
                <p className="text-muted-foreground mb-1">تاریخ ثبت انوایس</p>
                <p className="font-bold">{new Date(selectedInvoice.createdAt).toLocaleDateString('fa-IR')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg">نتیجه بررسی اسناد</Label>
              <div className="flex gap-4">
                <Button 
                  onClick={() => handleControlAction('controlled')}
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                >
                  <CheckCircle className="ml-2" />
                  تایید و کنترول شد
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const reason = window.prompt('دلیل استرداد را وارد کنید (اشتباه در کوتیشن، مقایسوی، تایید ساحه و غیره):');
                    if (reason) handleControlAction('rejected', reason);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-2xl border-destructive text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="ml-2" />
                  مسترد (رد) شود
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => setSelectedInvoice(null)}>بستن پنل بررسی</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[32px] border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right">شماره ثبت انوایس</TableHead>
              <TableHead className="text-right">ساحه</TableHead>
              <TableHead className="text-center">تایید ساحه</TableHead>
              <TableHead className="text-center">ارجاع به تدارکات</TableHead>
              <TableHead className="text-right">وضعیت کنترول</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  هیچ انوایسی جهت کنترول یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{inv.registrationNumber}</TableCell>
                  <TableCell>{inv.area}</TableCell>
                  <TableCell className="text-center">
                    {Number(inv.isAreaApproved) > 0 ? <CheckCircle className="mx-auto text-green-500" size={18} /> : <AlertCircle className="mx-auto text-amber-500" size={18} />}
                  </TableCell>
                  <TableCell className="text-center">
                    {Number(inv.isReferredToProcurement) > 0 ? <CheckCircle className="mx-auto text-green-500" size={18} /> : <XCircle className="mx-auto text-muted-foreground" size={18} />}
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-muted/30 text-muted-foreground">
                      در انتظار بررسی
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedInvoice(inv)}
                      className="rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                    >
                      بررسی اسناد
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
