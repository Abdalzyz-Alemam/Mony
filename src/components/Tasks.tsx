import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { addTask, toggleTask } from '../services/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Plus, Target, Calendar, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { deleteDoc, doc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Tasks() {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [taskType, setTaskType] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (s) => {
      setTasks(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    try {
      await addTask(user.uid, newTask, taskType);
      setNewTask('');
      toast.success(t('taskAdded'));
    } catch (error) {
      toast.error('Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
    } catch (e) {}
  };

  const dailyTasks = tasks.filter(task => task.type === 'daily');
  const weeklyGoals = tasks.filter(task => task.type === 'weekly');

  const TaskList = ({ items }: { items: any[] }) => (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {items.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm">{t('noItems')}</p>
        ) : items.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              task.completed ? 'bg-slate-50 border-transparent' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => user && toggleTask(user.uid, task.id, !task.completed)}>
              {task.completed ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500 fill-emerald-50" />
              ) : (
                <Circle className="h-6 w-6 text-slate-200" />
              )}
              <span className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                {task.title}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="h-8 w-8 text-slate-300 hover:text-rose-500 rounded-full">
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-start">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-light tracking-tight">{t('goalsTasks')}</h2>
        <p className="text-slate-500">{t('planDay')}</p>
      </div>

      <form onSubmit={handleAdd} className="bg-white p-2 rounded-2xl shadow-sm border flex items-center gap-2">
        <Input 
          placeholder={t('wantTo')} 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 border-none bg-transparent h-12 focus-visible:ring-0 text-lg"
        />
        <div className="hidden sm:flex border-l h-8 mx-2 border-slate-100" />
        <Select value={taskType} onValueChange={(v: any) => setTaskType(v)}>
          <SelectTrigger className="w-28 border-none bg-slate-50 h-10 rounded-xl hidden sm:flex">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-xl">
            <SelectItem value="daily" className="rounded-lg">{t('daily')}</SelectItem>
            <SelectItem value="weekly" className="rounded-lg">{t('weekly')}</SelectItem>
          </SelectContent>
        </Select>
        <Button disabled={!newTask.trim()} type="submit" className="rounded-xl h-10 w-10 p-0 bg-slate-900 shrink-0">
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest px-2">
            <Calendar className="h-4 w-4" /> {t('dailyChecklist')}
          </div>
          <TaskList items={dailyTasks} />
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest px-2">
            <Target className="h-4 w-4" /> {t('weeklyGoals')}
          </div>
          <TaskList items={weeklyGoals} />
        </div>
      </div>
    </div>
  );
}

