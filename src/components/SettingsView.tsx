import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { updateSettings } from '../services/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Info, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsView() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [sO, setSO] = useState(20);
  const [sP, setSP] = useState(30);
  const [sI, setSI] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setSO(data.splitObligations || 20);
        setSP(data.splitPersonal || 30);
        setSI(data.splitInvestment || 50);
      }
    });
    return unsubscribe;
  }, [user]);

  const handleSave = async () => {
    const total = sO + sP + sI;
    if (total !== 100) {
      toast.error(t('percentError'));
      return;
    }

    if (!user) return;
    setIsSaving(true);
    try {
      await updateSettings(user.uid, sO, sP, sI);
      toast.success(t('settingsUpdated'));
    } catch (error) {
      toast.error('Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSO(20);
    setSP(30);
    setSI(50);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-start">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-light tracking-tight">{t('settings')}</h2>
        <p className="text-slate-500">{t('strategyDesc')}</p>
      </div>

      <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b p-8">
          <CardTitle className="text-xl font-semibold">{t('incomeDistribution')}</CardTitle>
          <CardDescription>{t('distPolicy')}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('obligations')}</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    value={sO}
                    onChange={(e) => setSO(Number(e.target.value))}
                    className={`${isRTL ? 'pl-10 text-left' : 'pr-10 text-right'} h-12 bg-slate-50 border-none rounded-xl font-bold`}
                  />
                  <span className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 font-bold`}>%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('personal')}</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    value={sP}
                    onChange={(e) => setSP(Number(e.target.value))}
                    className={`${isRTL ? 'pl-10 text-left' : 'pr-10 text-right'} h-12 bg-slate-50 border-none rounded-xl font-bold`}
                  />
                  <span className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 font-bold`}>%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('investment')}</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    value={sI}
                    onChange={(e) => setSI(Number(e.target.value))}
                    className={`${isRTL ? 'pl-10 text-left' : 'pr-10 text-right'} h-12 bg-slate-50 border-none rounded-xl font-bold`}
                  />
                  <span className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 font-bold`}>%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${sO + sP + sI === 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {sO + sP + sI}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">{t('totalSelection')}</div>
                <div className="text-xs text-slate-500">{t('mustBe100')}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset} className="rounded-lg h-8 text-slate-500 hover:text-slate-900">
                <RefreshCcw className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} /> {t('resetDefaults')}
              </Button>
            </div>
          </div>

          <div className={`pt-4 border-t border-slate-100 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || sO + sP + sI !== 100}
              className="rounded-xl h-12 px-8 bg-slate-900 text-white hover:bg-slate-800"
            >
              <Save className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} /> {t('saveStrategy')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-indigo-50 p-6 rounded-3xl flex gap-4">
        <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shrink-0">
          <Info className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-900">{t('sysInfo')}</h4>
          <p className="text-sm text-indigo-700 leading-relaxed">
            {t('splitInfo')}
          </p>
        </div>
      </div>
    </div>
  );
}

