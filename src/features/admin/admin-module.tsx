import React, { useState, useEffect } from 'react';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, FileText, Send, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function AdminModule() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('letters');
  
  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">مدیریت اداری</h2>
          <p className="text-muted-foreground mt-1">ثبت و پیگیری مکاتبات، پیشنهادات و استعلام‌ها</p>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="letters" className="rounded-xl h-12 px-8 data-[state=active]:bg-primary data-[state=active]:text-white">
            <FileText size={18} className="ml-2" />
            مکتوب‌ها
          </TabsTrigger>
          <TabsTrigger value="proposals" className="rounded-xl h-12 px-8 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Send size={18} className="ml-2" />
            پیشنهادات
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="rounded-xl h-12 px-8 data-[state=active]:bg-primary data-[state=active]:text-white">
            <HelpCircle size={18} className="ml-2" />
            استعلام‌ها
          </TabsTrigger>
        </TabsList>

        <TabsContent value="letters">
          <LettersManager />
        </TabsContent>
        <TabsContent value="proposals">
          <ProposalsManager />
        </TabsContent>
        <TabsContent value="inquiries">
          <InquiriesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LettersManager() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLetters = async () => {
    try {
      setIsLoading(true);
      const data = await blink.db.letters.list({
        orderBy: { createdAt: 'desc' }
      });
      setLetters(data);
    } catch (error) {
      toast.error('خطا در بارگذاری مکتوب‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      setIsSubmitting(true);
      await blink.db.letters.create({
        ...data,
        branchId: 'admin',
        userId: user.id
      });
      toast.success('مکتوب با موفقیت ثبت شد');
      setShowForm(false);
      fetchLetters();
    } catch (error) {
      toast.error('خطا در ثبت مکتوب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Input placeholder="جستجو در مکتوب‌ها..." className="pr-10 rounded-xl bg-muted/30 border-none" />
          <Search size={18} className="absolute right-3 top-2.5 text-muted-foreground" />
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gradient-bg shadow-lg shadow-primary/20">
          <Plus size={20} className="ml-2" />
          ثبت مکتوب جدید
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-[32px] overflow-hidden border-2 border-primary/10 shadow-xl animate-fade-in mb-8">
          <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <FileText className="text-primary" />
              فرم ثبت مکتوب جدید
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>نمبر مکتوب</Label>
                <Input name="number" required placeholder="مثلاً: ۴۵۶/۱۴۰۲" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>تاریخ صدور</Label>
                <Input name="issueDate" type="date" required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>مرسل (فرستنده)</Label>
                <Input name="sender" required placeholder="بخش مربوطه" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>مرسل علیه (گیرنده)</Label>
                <Input name="recipient" required placeholder="مقصد مکتوب" className="rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>خلص موضوع</Label>
                <Input name="subject" required placeholder="شرح مختصر موضوع مکتوب" className="rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>اجراأت صورت گرفته</Label>
                <Input name="actions" placeholder="توضیحات اقدامات انجام شده" className="rounded-xl" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl px-8">انصراف</Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 gradient-bg shadow-lg shadow-primary/20">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'ثبت و ذخیره'}
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
              <TableHead className="text-right">نمبر مکتوب</TableHead>
              <TableHead className="text-right">تاریخ صدور</TableHead>
              <TableHead className="text-right">مرسل</TableHead>
              <TableHead className="text-right">مرسل علیه</TableHead>
              <TableHead className="text-right">موضوع</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : letters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  هیچ مکتوبی ثبت نشده است.
                </TableCell>
              </TableRow>
            ) : (
              letters.map((letter) => (
                <TableRow key={letter.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{letter.number}</TableCell>
                  <TableCell>{letter.issueDate}</TableCell>
                  <TableCell>{letter.sender}</TableCell>
                  <TableCell>{letter.recipient}</TableCell>
                  <TableCell className="max-w-xs truncate">{letter.subject}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 border border-green-500/20">
                      ثبت شده
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

function ProposalsManager() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      const data = await blink.db.proposals.list({
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      setIsSubmitting(true);
      await blink.db.proposals.create({
        ...data,
        branchId: 'admin',
        userId: user.id
      });
      toast.success('پیشنهاد با موفقیت ثبت شد');
      setShowForm(false);
      fetchProposals();
    } catch (error) {
      toast.error('خطا در ثبت پیشنهاد');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Input placeholder="جستجو در پیشنهادات..." className="pr-10 rounded-xl bg-muted/30 border-none" />
          <Search size={18} className="absolute right-3 top-2.5 text-muted-foreground" />
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gradient-bg shadow-lg shadow-primary/20">
          <Plus size={20} className="ml-2" />
          ثبت پیشنهاد جدید
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-[32px] overflow-hidden border-2 border-primary/10 shadow-xl animate-fade-in mb-8">
          <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <Send className="text-primary" />
              فرم ثبت پیشنهاد جدید
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>نمبر پیشنهاد</Label>
                <Input name="number" required placeholder="مثلاً: ۱۲۳" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>تاریخ پیشنهاد</Label>
                <Input name="date" type="date" required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>حکم نمبر</Label>
                <Input name="orderNumber" placeholder="شماره حکم آمر مربوطه" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>تاریخ حکم</Label>
                <Input name="orderDate" type="date" className="rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>موضوع پیشنهاد</Label>
                <Input name="subject" required placeholder="شرح کامل موضوع" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>قیمت تخمینی (افغانی)</Label>
                <Input name="estimatedPrice" type="number" required placeholder="مبلغ به افغانی" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>مرجع درخواست کننده</Label>
                <Input name="requestingBranch" required placeholder="شعبه متقاضی" className="rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>ارجاع به (هدف)</Label>
                <select name="targetBranch" required className="w-full h-12 bg-background border rounded-xl px-4 outline-none focus:ring-2 ring-primary/20">
                  <option value="">انتخاب مدیریت مربوطه...</option>
                  <option value="procurement">مدیریت تدارکات</option>
                  <option value="finance">مدیریت مالی</option>
                  <option value="assets">مدیریت محاسبه اجناس</option>
                  <option value="transport">مدیریت ترانسپورت</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl px-8">انصراف</Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 gradient-bg shadow-lg shadow-primary/20">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'ثبت پیشنهاد'}
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
              <TableHead className="text-right">تاریخ</TableHead>
              <TableHead className="text-right">موضوع</TableHead>
              <TableHead className="text-right">قیمت تخمینی</TableHead>
              <TableHead className="text-right">متقاضی</TableHead>
              <TableHead className="text-right">ارجاع شده به</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : proposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  هیچ پیشنهادی ثبت نشده است.
                </TableCell>
              </TableRow>
            ) : (
              proposals.map((prop) => (
                <TableRow key={prop.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{prop.number}</TableCell>
                  <TableCell>{prop.date}</TableCell>
                  <TableCell className="max-w-xs truncate">{prop.subject}</TableCell>
                  <TableCell>{Number(prop.estimatedPrice).toLocaleString()} افغانی</TableCell>
                  <TableCell>{prop.requestingBranch}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {prop.targetBranch === 'procurement' ? 'تدارکات' : 
                       prop.targetBranch === 'finance' ? 'مالی' : 
                       prop.targetBranch === 'assets' ? 'محاسبه اجناس' : 'ترانسپورت'}
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

function InquiriesManager() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const data = await blink.db.inquiries.list({
        orderBy: { createdAt: 'desc' }
      });
      setInquiries(data);
    } catch (error) {
      toast.error('خطا در بارگذاری استعلام‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      setIsSubmitting(true);
      await blink.db.inquiries.create({
        ...data,
        isAnswered: Number(data.isAnswered),
        branchId: 'admin',
        userId: user.id
      });
      toast.success('استعلام با موفقیت ثبت شد');
      setShowForm(false);
      fetchInquiries();
    } catch (error) {
      toast.error('خطا در ثبت استعلام');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Input placeholder="جستجو در استعلام‌ها..." className="pr-10 rounded-xl bg-muted/30 border-none" />
          <Search size={18} className="absolute right-3 top-2.5 text-muted-foreground" />
        </div>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gradient-bg shadow-lg shadow-primary/20">
          <Plus size={20} className="ml-2" />
          ثبت استعلام جدید
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-[32px] overflow-hidden border-2 border-primary/10 shadow-xl animate-fade-in mb-8">
          <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <HelpCircle className="text-primary" />
              فرم ثبت استعلام جدید
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>نمبر استعلام</Label>
                  <Input name="number" required placeholder="مثلاً: ۷۸۹/۱۴۰۲" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>وضعیت پاسخ</Label>
                  <select name="isAnswered" className="w-full h-12 bg-background border rounded-xl px-4 outline-none focus:ring-2 ring-primary/20">
                    <option value="0">پاسخ داده نشده</option>
                    <option value="1">پاسخ داده شده</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>موضوع استعلام</Label>
                <Input name="subject" required placeholder="شرح موضوع مورد پرسش" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>اجراأت و توضیحات</Label>
                <textarea name="actions" rows={3} placeholder="اقدامات انجام شده..." className="w-full bg-background border rounded-xl p-4 outline-none focus:ring-2 ring-primary/20 transition-all"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl px-8">انصراف</Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8 gradient-bg shadow-lg shadow-primary/20">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'ثبت استعلام'}
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
              <TableHead className="text-right">نمبر استعلام</TableHead>
              <TableHead className="text-right">موضوع</TableHead>
              <TableHead className="text-right">اقدامات</TableHead>
              <TableHead className="text-right">وضعیت پاسخ</TableHead>
              <TableHead className="text-right">تاریخ ثبت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  هیچ استعلامی ثبت نشده است.
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inq) => (
                <TableRow key={inq.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{inq.number}</TableCell>
                  <TableCell className="max-w-xs truncate">{inq.subject}</TableCell>
                  <TableCell className="max-w-xs truncate">{inq.actions || '---'}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold border",
                      Number(inq.isAnswered) > 0 
                        ? "bg-green-500/10 text-green-600 border-green-500/20" 
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )}>
                      {Number(inq.isAnswered) > 0 ? 'پاسخ داده شده' : 'در انتظار پاسخ'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(inq.createdAt).toLocaleDateString('fa-IR')}
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