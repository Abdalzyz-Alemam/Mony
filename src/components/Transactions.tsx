import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { deleteIncome, deleteExpense } from '../services/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Transactions() {
  const { user } = useAuth();
  const { t, isRTL, formatDate } = useLanguage();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;

    const incQuery = query(collection(db, 'users', user.uid, 'income'), orderBy('createdAt', 'desc'), limit(50));
    const expQuery = query(collection(db, 'users', user.uid, 'expenses'), orderBy('createdAt', 'desc'), limit(50));

    const unsubInc = onSnapshot(incQuery, (s) => {
      setIncomes(s.docs.map(doc => ({ id: doc.id, type: 'income', ...doc.data() })));
    });

    const unsubExp = onSnapshot(expQuery, (s) => {
      setExpenses(s.docs.map(doc => ({ id: doc.id, type: 'expense', ...doc.data() })));
    });

    return () => { unsubInc(); unsubExp(); };
  }, [user]);

  const allTransactions = [...incomes, ...expenses].sort((a, b) => {
    const dateA = a.createdAt?.toDate() || new Date(0);
    const dateB = b.createdAt?.toDate() || new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  const filtered = allTransactions.filter(transaction => {
    const text = (transaction.source || transaction.category || transaction.note || '').toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handleDelete = async (transaction: any) => {
    if (!user) return;
    try {
      if (transaction.type === 'income') {
        await deleteIncome(user.uid, transaction.id);
      } else {
        await deleteExpense(user.uid, transaction.id);
      }
      toast.success(t('transRemoved'));
    } catch (error) {
      toast.error(t('failDelete'));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-light tracking-tight">{t('activity')}</h2>
        <div className="relative w-full sm:w-72">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
          <Input 
            placeholder={t('searchPlaceholder')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl border-none bg-white shadow-sm h-11`}
          />
        </div>
      </div>

      <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
              <thead>
                <tr className="border-b bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">{t('dateCol')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">{t('transCol')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">{t('accountCol')}</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 ${isRTL ? 'text-left' : 'text-right'}`}>{t('amountCol')}</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                        {t('noTransactions')}
                      </td>
                    </tr>
                  ) : filtered.map((transaction) => (
                    <motion.tr 
                      key={transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      className="border-b last:border-0 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">
                          {transaction.date ? formatDate(transaction.date, 'MMM d, yyyy') : t('recently')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {transaction.type === 'income' ? (
                            <ArrowUpCircle className="h-8 w-8 text-emerald-500 bg-emerald-50 rounded-full p-1.5" />
                          ) : (
                            <ArrowDownCircle className="h-8 w-8 text-rose-500 bg-rose-50 rounded-full p-1.5" />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{transaction.source || transaction.category}</div>
                            {transaction.note && <div className="text-xs text-slate-400">{transaction.note}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold tracking-tight px-2 py-1 rounded-md ${
                          transaction.account === 'obligations' ? 'bg-indigo-50 text-indigo-600' :
                          transaction.account === 'personal' ? 'bg-orange-50 text-orange-600' :
                          transaction.type === 'income' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {transaction.type === 'income' ? t('splitAll') : t(transaction.account) || transaction.account}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className={`text-sm font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'} w-10`}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(transaction)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

