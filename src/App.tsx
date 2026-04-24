/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  LayoutDashboard, 
  Receipt, 
  CheckSquare, 
  Settings, 
  Languages, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Tasks from './components/Tasks';
import SettingsView from './components/SettingsView';
import { motion, AnimatePresence } from 'motion/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function AppContent() {
  const { user, loading, login, logout } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f5f5]">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-2xl font-light text-slate-400"
        >
          {t('appName')}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#f5f5f5] text-slate-900 pb-20 md:pb-0 font-sans ${isRTL ? 'font-arabic' : ''}`}>
      <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg">F</div>
            <span className="text-xl font-semibold tracking-tight">{t('appName')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="rounded-xl border-none shadow-xl">
                <DropdownMenuItem onClick={() => setLanguage('ar')} className="rounded-lg h-10 px-4 cursor-pointer focus:bg-slate-100">العربية (Arabic)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-lg h-10 px-4 cursor-pointer focus:bg-slate-100">English</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!user.isAnonymous && <span className="hidden text-sm font-medium text-slate-500 lg:inline-block">{user.email}</span>}
            <Button variant="ghost" size="icon" onClick={logout} className="rounded-full hover:bg-slate-100">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="flex items-center justify-center sm:justify-start overflow-x-auto scrollbar-hide py-1">
            <TabsList className="bg-white p-1 rounded-2xl border shadow-sm h-14 w-fit inline-flex">
              <TabsTrigger value="dashboard" className="rounded-xl px-4 sm:px-6 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                <LayoutDashboard className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                <span className="text-sm font-medium">{t('dashboard')}</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-xl px-4 sm:px-6 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                <Receipt className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                <span className="text-sm font-medium">{t('activity')}</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-xl px-4 sm:px-6 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                <CheckSquare className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                <span className="text-sm font-medium">{t('goals')}</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl px-4 sm:px-6 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                <Settings className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                <span className="text-sm font-medium">{t('settings')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <div className="min-h-[60vh]">
              <TabsContent value="dashboard" className="focus-visible:outline-none focus-visible:ring-0">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <Dashboard />
                </motion.div>
              </TabsContent>
              <TabsContent value="transactions" className="focus-visible:outline-none focus-visible:ring-0">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <Transactions />
                </motion.div>
              </TabsContent>
              <TabsContent value="tasks" className="focus-visible:outline-none focus-visible:ring-0">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <Tasks />
                </motion.div>
              </TabsContent>
              <TabsContent value="settings" className="focus-visible:outline-none focus-visible:ring-0">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <SettingsView />
                </motion.div>
              </TabsContent>
            </div>
          </AnimatePresence>
        </Tabs>
      </main>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}


