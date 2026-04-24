import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { addIncome, addExpense } from '../services/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DollarSign, Tag, Briefcase, Calendar as CalendarIcon, FileText, FastForward } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddTransactionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: 'income' | 'expense';
}

const CATEGORIES = ['catFood', 'catTransport', 'catBills', 'catFun', 'catHealth', 'catShopping', 'catOther'];
const QUICK_AMOUNTS = [10, 20, 50, 100];

export default function AddTransaction({ open, onOpenChange, initialType }: AddTransactionProps) {
  const { user } = useAuth();
  const { t, isRTL, formatDate } = useLanguage();
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('catOther');
  const [account, setAccount] = useState<'obligations' | 'personal' | 'investment'>('personal');
  const [date, setDate] = useState<Date>(new Date());
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setType(initialType);
    if (initialType === 'income') setAccount('personal');
    else setAccount('personal');
  }, [initialType, open]);

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error(t('validAmount'));
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      if (type === 'income') {
        const sourceTranslated = source || t('transCol');
        await addIncome(user.uid, Number(amount), sourceTranslated, date.toISOString());
        toast.success(t('incomeAdded'));
      } else {
        await addExpense(user.uid, Number(amount), t(category), account, date.toISOString(), note);
        toast.success(t('expenseAdded'));
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('catOther');
    setAccount('personal');
    setSource('');
    setNote('');
    setDate(new Date());
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden bg-white border-none shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-slate-900 p-6 text-white text-start">
          <DialogTitle className="text-2xl font-semibold tracking-tight">{t('newTransaction')}</DialogTitle>
          <DialogDescription className="text-slate-400">{t('quickRecord')}</DialogDescription>
          
          <Tabs value={type} onValueChange={(v) => setType(v as any)} className="mt-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 p-1 rounded-xl h-11">
              <TabsTrigger value="expense" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">{t('addExpense')}</TabsTrigger>
              <TabsTrigger value="income" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900">{t('addIncome')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-6 space-y-6 text-start">
          <div className="space-y-4">
            <div className="relative">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">{t('amount')}</Label>
              <div className="relative group">
                <DollarSign className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors`} />
                <Input 
                  type="number" 
                  autoFocus
                  placeholder="0.00" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} h-14 text-2xl font-semibold bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-slate-900`}
                />
              </div>
              <div className="flex gap-2 mt-2">
                {QUICK_AMOUNTS.map(val => (
                  <Button 
                    key={val} 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleQuickAmount(val)}
                    className="h-8 rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 font-medium px-3 text-xs"
                  >
                    +{val}
                  </Button>
                ))}
              </div>
            </div>

            {type === 'expense' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('category')}</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-2xl">
                        <Tag className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 text-slate-400`} />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        {CATEGORIES.map(c => <SelectItem key={c} value={c} className="rounded-lg">{t(c)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('account')}</Label>
                    <Select value={account} onValueChange={(v: any) => setAccount(v)}>
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-2xl">
                        <Briefcase className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 text-slate-400`} />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="obligations" className="rounded-lg">{t('obligations')}</SelectItem>
                        <SelectItem value="personal" className="rounded-lg">{t('personal')}</SelectItem>
                        <SelectItem value="investment" className="rounded-lg">{t('investment')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('noteOptional')}</Label>
                  <div className="relative">
                    <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-slate-400`} />
                    <Input 
                      placeholder={t('notePlaceholder')} 
                      value={note} 
                      onChange={(e) => setNote(e.target.value)}
                      className={`${isRTL ? 'pr-10' : 'pl-10'} h-12 bg-slate-50 border-none rounded-2xl`}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('source')}</Label>
                <div className="relative">
                  <Briefcase className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-slate-400`} />
                  <Input 
                    placeholder={t('sourcePlaceholder')} 
                    value={source} 
                    onChange={(e) => setSource(e.target.value)}
                    className={`${isRTL ? 'pr-10' : 'pl-10'} h-12 bg-slate-50 border-none rounded-2xl`}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-start font-normal bg-slate-50 border-none rounded-2xl",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 text-slate-400`} />
                    {date ? formatDate(date, "PPP") : <span>{t('pickDate')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-lg font-semibold shadow-lg shadow-slate-200"
          >
            {isSubmitting ? t('processing') : (
              <span className="flex items-center gap-2">
                <FastForward className="h-5 w-5" /> {t('submit')}
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

