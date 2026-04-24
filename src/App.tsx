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
  const { user, loading, login, loginEmail, registerEmail, logout } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await loginEmail(email, password);
      } else {
        if (!username) {
          toast.error(t('usernameRequired') || 'Username required');
          return;
        }
        await registerEmail(email, password, username);
      }
    } catch (error) {
      toast.error(t('errorAuth'));
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
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

  if (!user) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 font-sans ${isRTL ? 'font-arabic' : ''}`}>
        <div className="grid w-full max-w-5xl gap-12 lg:grid-cols-2 items-center">
          {/* Brand/Hero Section */}
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            className={`space-y-8 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-slate-200">F</div>
              <h1 className="text-5xl font-bold tracking-tighter text-slate-900">{t('appName')}</h1>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-light leading-snug text-slate-600">
                {t('welcomeBack') || 'Manage your wealth with elegance.'}
              </h2>
              <p className="max-w-md text-lg text-slate-500 leading-relaxed italic">
                "{t('appTagline')}"
              </p>
            </div>
            
            <div className="pt-8">
              <Button variant="outline" size="sm" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="rounded-full bg-white border-slate-200 h-10 px-6 font-medium text-slate-600 hover:text-slate-900 shadow-sm transition-all">
                <Languages className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
              </Button>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className={`w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100 ${isRTL ? 'text-right' : 'text-left'}`}>
              <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-2xl h-14 mb-8">
                  <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-sm font-semibold">{t('signIn')}</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-sm font-semibold">{t('createAccount')}</TabsTrigger>
                </TabsList>

                <form onSubmit={handleEmailAuth} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {authMode === 'register' && (
                      <motion.div
                        key="username"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">{t('username')}</Label>
                        <div className="relative group">
                          <UserIcon className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors`} />
                          <Input 
                            required
                            placeholder={t('username')}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`${isRTL ? 'pr-12' : 'pl-12'} h-14 bg-slate-50 border-none rounded-2xl text-lg font-medium shadow-inner focus-visible:ring-2 focus-visible:ring-slate-900`}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">{t('email')}</Label>
                    <div className="relative group">
                      <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors`} />
                      <Input 
                        type="email"
                        required
                        placeholder={t('email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${isRTL ? 'pr-12' : 'pl-12'} h-14 bg-slate-50 border-none rounded-2xl text-lg font-medium shadow-inner focus-visible:ring-2 focus-visible:ring-slate-900`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">{t('password')}</Label>
                    <div className="relative group">
                      <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors`} />
                      <Input 
                        type="password"
                        required
                        placeholder={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${isRTL ? 'pr-12' : 'pl-12'} h-14 bg-slate-50 border-none rounded-2xl text-lg font-medium shadow-inner focus-visible:ring-2 focus-visible:ring-slate-900`}
                      />
                    </div>
                  </div>

                  <Button disabled={authLoading} type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 h-16 rounded-[1.25rem] text-xl font-bold transition-all transform active:scale-95 shadow-xl shadow-slate-200">
                    <AnimatePresence mode="wait">
                      {authLoading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="loading">...</motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="content" className="flex items-center gap-3">
                          {authMode === 'login' ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                          {authMode === 'login' ? t('signIn') : t('createAccount')}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or</span></div>
                </div>

                <Button variant="outline" onClick={login} className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t('signInGoogle')}
                </Button>
              </Tabs>
            </div>
          </motion.div>
        </div>
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

            <span className="hidden text-sm font-medium text-slate-500 lg:inline-block">{user.email}</span>
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


