import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, PiggyBank, ShoppingCart, ShieldCheck, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import AddTransaction from './AddTransaction';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, isRTL, formatDate } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [initialType, setInitialType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });
    return unsubscribe;
  }, [user]);

  const handleAdd = (type: 'income' | 'expense') => {
    setInitialType(type);
    setShowAddTransaction(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'SAR' }).format(amount || 0);
  };

  const getHealthStatus = () => {
    if (!userData) return { status: t('healthGood'), color: 'text-emerald-500', bg: 'bg-emerald-50' };
    const ratio = (userData.totalExpenses || 0) / (userData.totalIncome || 1);
    if (ratio > 0.9) return { status: t('healthRisk'), color: 'text-rose-500', bg: 'bg-rose-50' };
    if (ratio > 0.7) return { status: t('healthWarning'), color: 'text-amber-500', bg: 'bg-amber-50' };
    return { status: t('healthGood'), color: 'text-emerald-500', bg: 'bg-emerald-50' };
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-light tracking-tight">{t('overview')}</h2>
          <p className="text-slate-500">{t('snapshot')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleAdd('income')} className="rounded-xl bg-slate-900 border-none h-12 px-6">
            <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} /> {t('addIncome')}
          </Button>
          <Button onClick={() => handleAdd('expense')} variant="outline" className="rounded-xl border-slate-200 h-12 px-6 bg-white">
            <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} /> {t('addExpense')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div whileHover={{ y: -4 }}>
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('obligations')}</span>
              </div>
              <CardTitle className="text-3xl font-light pt-2">{formatCurrency(userData?.balanceObligations)}</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <div className="h-1 w-1 rounded-full bg-indigo-500" />
                {t('obligationsDesc')}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('personal')}</span>
              </div>
              <CardTitle className="text-3xl font-light pt-2">{formatCurrency(userData?.balancePersonal)}</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <div className="h-1 w-1 rounded-full bg-orange-500" />
                {t('personalDesc')}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <PiggyBank className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('investment')}</span>
              </div>
              <CardTitle className="text-3xl font-light pt-2">{formatCurrency(userData?.balanceInvestment)}</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                {t('investmentDesc')}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 rounded-3xl border-none shadow-sm bg-white p-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-400" /> {t('cashFlow')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8 py-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-tight">{t('totalIncome')}</span>
                <div className="flex items-baseline gap-2">
                   <div className="text-2xl font-semibold text-slate-900">{formatCurrency(userData?.totalIncome)}</div>
                  <div className="flex items-center text-emerald-500 text-xs font-medium">
                    <ArrowUpRight className="h-3 w-3" /> 100%
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-tight">{t('totalExpenses')}</span>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-semibold text-slate-900">{formatCurrency(userData?.totalExpenses)}</div>
                  <div className="flex items-center text-rose-500 text-xs font-medium">
                    <ArrowDownRight className="h-3 w-3" /> {userData?.totalIncome ? ((userData.totalExpenses / userData.totalIncome) * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{t('budgetUsage')}</span>
                <span className="text-sm font-bold text-slate-900">
                  {userData?.totalIncome ? ((userData.totalExpenses / userData.totalIncome) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(userData?.totalIncome ? (userData.totalExpenses / userData.totalIncome) * 100 : 0, 100)}%` }}
                  className={`h-full ${health.bg.replace('bg-', 'bg-').split(' ')[0] === 'bg-emerald-50' ? 'bg-emerald-500' : health.bg.replace('bg-', 'bg-').split(' ')[0] === 'bg-amber-50' ? 'bg-amber-500' : 'bg-rose-500'}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('healthStatus')}</CardTitle>
            <CardDescription>{t('basedOnRatio')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4 pb-8 space-y-4">
            <div className={`h-24 w-24 rounded-full flex items-center justify-center ${health.bg} border-2 border-white shadow-inner`}>
              <span className={`text-xl font-bold ${health.color}`}>{health.status}</span>
            </div>
            <p className="text-center text-sm text-slate-500 max-w-[200px]">
              {health.status === t('healthGood') ? t('healthGoodMsg') : 
               health.status === t('healthWarning') ? t('healthWarningMsg') :
               t('healthRiskMsg')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium px-2">{t('recentActivity')}</h3>
        <RecentActivity />
      </div>

      <AddTransaction 
        open={showAddTransaction} 
        onOpenChange={setShowAddTransaction} 
        initialType={initialType} 
      />
    </div>
  );
}

function RecentActivity() {
  const { user } = useAuth();
  const { t, isRTL, formatDate } = useLanguage();
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'expenses'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (s) => {
      setRecent(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  if (recent.length === 0) return (
    <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-dashed border-slate-200">
      {t('noRecent')}
    </div>
  );

  return (
    <div className="grid gap-3">
      {recent.map((t_item) => (
        <div key={t_item.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-transparent hover:border-slate-100 transition-all">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{t_item.category}</div>
              <div className="text-xs text-slate-400">{t(t_item.account) || t_item.account} • {t_item.date ? formatDate(t_item.date, 'MMM d') : ''}</div>
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900">
            -{new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', { style: 'currency', currency: 'SAR' }).format(t_item.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}


