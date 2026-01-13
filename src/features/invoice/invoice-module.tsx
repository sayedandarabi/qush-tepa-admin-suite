import React, { useState, useEffect } from 'react';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Loader2, CheckCircle2, XCircle, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

export function InvoiceModule() {
  const { user } = useAuth();
  const [procurements, setProcurements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProc, setSelectedProc] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoicedProcurements = async () => {
    try {
      setIsLoading(true);
      // We need procurements that are contracted but don't necessarily have an invoice record yet
      const data = await blink.db.procurements.list({
        where: { isContracted: "1" },
        orderBy: { createdAt: 'desc' }
      });
      setProcurements(data);
    } catch (error) {
      toast.error('خطا در بارگذاری اطلاعات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicedProcurements();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProc) return;
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      setIsSubmitting(true);
      // Create invoice record
      await blink.db.invoices.create({
        procurementId: selectedProc.id,
        area: data.area,
        registrationNumber: data.registrationNumber,
        isAreaApproved: data.isAreaApproved === 'on' ? 1 : 0,
        isReferredToProcurement: data.isReferredToProcurement === 'on' ? 1 : 0,
        branchId: 'invoice',
        userId: user.id
      });
      
      // Update procurement status
      await blink.db.procurements.update(selectedProc.id, {
        hasInvoice: 1
      });
      
      toast.success('اطلاعات انوایس با موفقیت ثبت شد');
      setSelectedProc(null);
      fetchInvoicedProcurements();
    } catch (error) {
      toast.error('خطا در ثبت انوایس');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">شعبه انوایس</h2>
          <p className="text-muted-foreground mt-1">ثبت انوایس، تایید ساحه و ارجاع اسناد به تدارکات</p>
        </div>
      </div>

      {selectedProc && (
        <Card className="rounded-[32px] overflow-hidden border-2 border-primary/10 shadow-xl animate-fade-in mb-8">
          <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <Receipt className="text-primary" />
              ثبت انوایس برای قرارداد: {selectedProc.pricingNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleCreateInvoice} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>ساحه مربوطه (جهت حکم)</Label>
                <Input name="area" required placeholder="نام ساحه یا پروژه" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>شماره ثبت انوایس</Label>
                <Input name="registrationNumber" required placeholder="شماره ثبت دفتری" className="rounded-xl" />
              </div>
              <div className="flex items-center gap-8 px-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isAreaApproved" id="isAreaApproved" className="w-5 h-5 accent-primary" />
                  <Label htmlFor="isAreaApproved">تایید ساحه شده است؟</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isReferredToProcurement" id="isReferredToProcurement" className="w-5 h-5 accent-primary" />
                  <Label htmlFor="isReferredToProcurement">از اداری به تدارکات ارجاع گردید؟</Label>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedProc(null)} className="rounded-xl px-8">انصراف</Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 gradient-bg shadow-lg shadow-primary/20">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'تایید و ارجاع انوایس'}
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
              <TableHead className="text-right">شماره نرخ‌گیری</TableHead>
              <TableHead className="text-right">شرکت / شخص</TableHead>
              <TableHead className="text-right">مبلغ</TableHead>
              <TableHead className="text-right">وضعیت انوایس</TableHead>
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
            ) : procurements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  هیچ قراردادی جهت ثبت انوایس یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              procurements.map((proc) => (
                <TableRow key={proc.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{proc.pricingNumber}</TableCell>
                  <TableCell>{proc.companyName}</TableCell>
                  <TableCell>{Number(proc.grossAmount).toLocaleString()} افغانی</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold border",
                      Number(proc.hasInvoice) > 0 
                        ? "bg-green-500/10 text-green-600 border-green-500/20" 
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )}>
                      {Number(proc.hasInvoice) > 0 ? 'ثبت شده' : 'منتظر ثبت'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedProc(proc)}
                      className="rounded-lg text-primary hover:bg-primary/10"
                    >
                      <Receipt size={18} className="ml-2" />
                      ثبت انوایس
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
