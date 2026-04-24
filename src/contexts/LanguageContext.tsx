import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const translations: Translations = {
  // App General
  appName: { ar: 'فين فليكس', en: 'FinFlex' },
  appTagline: { ar: 'تحكم في ثروتك بنظام 20/30/50', en: 'Master your wealth with the 20/30/50 system.' },
  signIn: { ar: 'تسجيل الدخول', en: 'Sign In' },
  signInGoogle: { ar: 'الدخول عبر جوجل', en: 'Sign in with Google' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  username: { ar: 'اسم المستخدم', en: 'Username' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  createAccount: { ar: 'إنشاء حساب جديد', en: 'Create Account' },
  alreadyHaveAccount: { ar: 'لديك حساب بالفعل؟ سجل دخولك', en: 'Already have an account? Sign in' },
  needAccount: { ar: 'ليس لديك حساب؟ انضم إلينا', en: "Don't have an account? Join us" },
  welcomeBack: { ar: 'مرحباً بعودتك!', en: 'Welcome Back!' },
  joinUs: { ar: 'ابدأ رحلتك المالية', en: 'Start your journey' },
  errorAuth: { ar: 'خطأ في المصادقة. يرجى التحقق من البيانات.', en: 'Authentication error. Please check your data.' },
  usernameRequired: { ar: 'اسم المستخدم مطلوب', en: 'Username is required' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  activity: { ar: 'النشاط', en: 'Activity' },
  goals: { ar: 'الأهداف', en: 'Goals' },
  settings: { ar: 'الإعدادات', en: 'Settings' },

  // Dashboard
  overview: { ar: 'نظرة عامة', en: 'Overview' },
  snapshot: { ar: 'ملخصك المالي اليوم', en: 'Your financial snapshot today.' },
  addIncome: { ar: 'إضافة دخل', en: 'Add Income' },
  addExpense: { ar: 'إضافة مصروف', en: 'Add Expense' },
  obligations: { ar: 'الالتزامات', en: 'Obligations' },
  personal: { ar: 'الشخصي', en: 'Personal' },
  investment: { ar: 'الاستثمار', en: 'Investment' },
  obligationsDesc: { ar: 'مخصص للفواتير والتكاليف الثابتة', en: 'Allocated for bills & fixed costs' },
  personalDesc: { ar: 'نمط الحياة والإنفاق اليومي', en: 'Lifestyle & daily spending' },
  investmentDesc: { ar: 'بناء الثروة على المدى الطويل', en: 'Long-term wealth building' },
  cashFlow: { ar: 'ملخص التدفق النقدي', en: 'Cash Flow Summary' },
  totalIncome: { ar: 'إجمالي الدخل', en: 'Total Income' },
  totalExpenses: { ar: 'إجمالي المصاريف', en: 'Total Expenses' },
  budgetUsage: { ar: 'استخدام الميزانية الشهرية', en: 'Monthly Budget Usage' },
  healthStatus: { ar: 'الحالة المالية', en: 'Health Status' },
  basedOnRatio: { ar: 'بناءً على نسبة إنفاقك', en: 'Based on your spending ratio.' },
  healthGood: { ar: 'جيد', en: 'Good' },
  healthWarning: { ar: 'تحذير', en: 'Warning' },
  healthRisk: { ar: 'خطر', en: 'Risk' },
  healthGoodMsg: { ar: 'أنت تنفق بحكمة وفي حدود إمكانياتك. استمر!', en: "You're living well within your means. Keep it up!" },
  healthWarningMsg: { ar: 'الإنفاق بدأ يرتفع. حاول تقليل التكاليف الشخصية.', en: "Spending is getting high. Try to cut back on Personal costs." },
  healthRiskMsg: { ar: 'تم اكتشاف مخاطر عالية. راجع التزاماتك وقلل الإنفاق الشخصي.', en: "High risk detected. Review your Obligations and minimize Personal spending." },
  recentActivity: { ar: 'النشاط الأخير', en: 'Recent Activity' },
  noRecent: { ar: 'لا توجد معاملات أخيرة.', en: 'No recent transactions.' },
  recently: { ar: 'مؤخراً', en: 'Recently' },

  // Transaction Form
  newTransaction: { ar: 'معاملة جديدة', en: 'New Transaction' },
  quickRecord: { ar: 'سجل نشاطك المالي بسرعة.', en: 'Quickly record your financial activity.' },
  amount: { ar: 'المبلغ', en: 'Amount' },
  category: { ar: 'الفئة', en: 'Category' },
  account: { ar: 'الحساب', en: 'Account' },
  noteOptional: { ar: 'ملاحظة (اختياري)', en: 'Note (Optional)' },
  notePlaceholder: { ar: 'ماذا كان هذا الإنفاق ولماذا؟', en: 'What was this for?' },
  source: { ar: 'المصدر', en: 'Source' },
  sourcePlaceholder: { ar: 'راتب، عمل حر، هدية...', en: 'Salary, Freelance, Gift...' },
  date: { ar: 'التاريخ', en: 'Date' },
  pickDate: { ar: 'اختر تاريخاً', en: 'Pick a date' },
  submit: { ar: 'إرسال', en: 'Submit' },
  processing: { ar: 'جاري المعالجة...', en: 'Processing...' },
  incomeAdded: { ar: 'تم إضافة الدخل وتقسيمه تلقائياً!', en: 'Income added and split automatically!' },
  expenseAdded: { ar: 'تم تسجيل المصروف بنجاح.', en: 'Expense tracked successfully.' },
  validAmount: { ar: 'يرجى إدخال مبلغ صحيح', en: 'Please enter a valid amount' },

  // Activity View
  searchPlaceholder: { ar: 'ابحث في المعاملات...', en: 'Search transactions...' },
  noTransactions: { ar: 'لم يتم العثور على معاملات.', en: 'No transactions found.' },
  dateCol: { ar: 'التاريخ', en: 'Date' },
  transCol: { ar: 'المعاملة', en: 'Transaction' },
  accountCol: { ar: 'الحساب', en: 'Account' },
  amountCol: { ar: 'المبلغ', en: 'Amount' },
  splitAll: { ar: 'تقسيم (الكل)', en: 'Split (All)' },
  transRemoved: { ar: 'تم حذف المعاملة.', en: 'Transaction removed.' },
  failDelete: { ar: 'فشل الحذف.', en: 'Failed to delete.' },

  // Goals View
  goalsTasks: { ar: 'الأهداف والمهام', en: 'Goals & Tasks' },
  planDay: { ar: 'خطط ليومك، نمِّ ثروتك.', en: 'Plan your day, grow your wealth.' },
  wantTo: { ar: 'أريد أن...', en: 'I want to...' },
  daily: { ar: 'يومي', en: 'Daily' },
  weekly: { ar: 'أسبوعي', en: 'Weekly' },
  dailyChecklist: { ar: 'قائمة المهام اليومية', en: 'Daily Checklist' },
  weeklyGoals: { ar: 'أهداف الأسبوع', en: 'Weekly Goals' },
  taskAdded: { ar: 'تمت إضافة المهمة!', en: 'Task added!' },
  noItems: { ar: 'لا توجد عناصر بعد.', en: 'No items yet.' },

  // Settings View
  strategyDesc: { ar: 'خصص استراتيجيتك المالية.', en: 'Fine-tune your financial strategy.' },
  incomeDistribution: { ar: 'توزيع الدخل', en: 'Income Distribution' },
  distPolicy: { ar: 'حدد كيف يتم تقسيم كل ريال تكسبه بين حساباتك.', en: 'Define how every dollar you earn is divided between your accounts.' },
  totalSelection: { ar: 'إجمالي التحديد', en: 'Total Selection' },
  mustBe100: { ar: 'يجب أن يساوي 100% تماماً.', en: 'Must equal precisely 100%.' },
  resetDefaults: { ar: 'استعادة الافتراضي', en: 'Reset Defaults' },
  saveStrategy: { ar: 'حفظ الاستراتيجية', en: 'Save Strategy' },
  sysInfo: { ar: 'معلومات النظام', en: 'System Information' },
  splitInfo: { ar: 'تغيير هذه النسب سيؤثر فقط على الدخل الجديد المضاف من الآن فصاعداً. الأرصدة الحالية ستبقى كما هي.', en: 'Changing these splits will only affect new income added from now on. Existing balances will remain unchanged.' },
  settingsUpdated: { ar: 'تم تحديث الإعدادات!', en: 'Settings updated!' },
  percentError: { ar: 'يجب أن يكون المجموع 100%', en: 'Percentages must total 100%' },

  // Categories
  catFood: { ar: 'طعام', en: 'Food' },
  catTransport: { ar: 'مواصلات', en: 'Transport' },
  catBills: { ar: 'فواتير', en: 'Bills' },
  catFun: { ar: 'ترفيه', en: 'Fun' },
  catHealth: { ar: 'صحة', en: 'Health' },
  catShopping: { ar: 'تسوق', en: 'Shopping' },
  catOther: { ar: 'أخرى', en: 'Other' },
};

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
  formatDate: (date: Date | string, pattern: string) => string;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const formatDate = (date: Date | string, pattern: string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, pattern, { locale: language === 'ar' ? ar : enUS });
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, t, formatDate, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
