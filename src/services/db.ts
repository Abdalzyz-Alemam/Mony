import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  runTransaction,
  limit
} from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';

const handleFirestoreError = (error: any, operationType: string, path: string | null = null) => {
  const user = auth.currentUser;
  const errorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType,
    path,
    authInfo: user ? {
      userId: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      providerInfo: user.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || '',
      })),
    } : null
  };
  console.error('Firestore Error:', errorInfo);
  throw new Error(JSON.stringify(errorInfo));
};

export const addIncome = async (userId: string, amount: number, source: string, date: string) => {
  const userRef = doc(db, 'users', userId);
  const incomeCollection = collection(db, 'users', userId, 'income');

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("User document does not exist");

      const userData = userDoc.data();
      const sO = userData.splitObligations / 100;
      const sP = userData.splitPersonal / 100;
      const sI = userData.splitInvestment / 100;

      const incO = amount * sO;
      const incP = amount * sP;
      const incI = amount * sI;

      transaction.update(userRef, {
        balanceObligations: (userData.balanceObligations || 0) + incO,
        balancePersonal: (userData.balancePersonal || 0) + incP,
        balanceInvestment: (userData.balanceInvestment || 0) + incI,
        totalIncome: (userData.totalIncome || 0) + amount,
        updatedAt: serverTimestamp()
      });

      const newIncomeRef = doc(incomeCollection);
      transaction.set(newIncomeRef, {
        amount,
        source,
        date,
        splitObligations: incO,
        splitPersonal: incP,
        splitInvestment: incI,
        createdAt: serverTimestamp()
      });
    });
  } catch (error) {
    handleFirestoreError(error, 'write', `/users/${userId}/income`);
  }
};

export const addExpense = async (userId: string, amount: number, category: string, account: 'obligations' | 'personal' | 'investment', date: string, note: string) => {
  const userRef = doc(db, 'users', userId);
  const expenseCollection = collection(db, 'users', userId, 'expenses');

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw new Error("User document does not exist");

      const userData = userDoc.data();
      const balanceField = `balance${account.charAt(0).toUpperCase() + account.slice(1)}`;
      const currentBalance = userData[balanceField] || 0;

      transaction.update(userRef, {
        [balanceField]: currentBalance - amount,
        totalExpenses: (userData.totalExpenses || 0) + amount,
        updatedAt: serverTimestamp()
      });

      const newExpenseRef = doc(expenseCollection);
      transaction.set(newExpenseRef, {
        amount,
        category,
        account,
        date,
        note,
        createdAt: serverTimestamp()
      });
    });
  } catch (error) {
    handleFirestoreError(error, 'write', `/users/${userId}/expenses`);
  }
};

export const addTask = async (userId: string, title: string, type: 'daily' | 'weekly') => {
  try {
    const tasksCollection = collection(db, 'users', userId, 'tasks');
    await addDoc(tasksCollection, {
      title,
      type,
      completed: false,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, 'create', `/users/${userId}/tasks`);
  }
};

export const toggleTask = async (userId: string, taskId: string, completed: boolean) => {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, { completed });
  } catch (error) {
    handleFirestoreError(error, 'update', `/users/${userId}/tasks/${taskId}`);
  }
};

export const deleteIncome = async (userId: string, incomeId: string) => {
  const userRef = doc(db, 'users', userId);
  const incomeRef = doc(db, 'users', userId, 'income', incomeId);

  try {
    await runTransaction(db, async (transaction) => {
      const incDoc = await transaction.get(incomeRef);
      if (!incDoc.exists()) return;

      const incData = incDoc.data();
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      transaction.update(userRef, {
        balanceObligations: (userData.balanceObligations || 0) - (incData.splitObligations || 0),
        balancePersonal: (userData.balancePersonal || 0) - (incData.splitPersonal || 0),
        balanceInvestment: (userData.balanceInvestment || 0) - (incData.splitInvestment || 0),
        totalIncome: (userData.totalIncome || 0) - (incData.amount || 0),
        updatedAt: serverTimestamp()
      });

      transaction.delete(incomeRef);
    });
  } catch (error) {
    handleFirestoreError(error, 'delete', `/users/${userId}/income/${incomeId}`);
  }
};

export const deleteExpense = async (userId: string, expenseId: string) => {
  const userRef = doc(db, 'users', userId);
  const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);

  try {
    await runTransaction(db, async (transaction) => {
      const expDoc = await transaction.get(expenseRef);
      if (!expDoc.exists()) return;

      const expData = expDoc.data();
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const balanceField = `balance${expData.account.charAt(0).toUpperCase() + expData.account.slice(1)}`;

      transaction.update(userRef, {
        [balanceField]: (userData[balanceField] || 0) + (expData.amount || 0),
        totalExpenses: (userData.totalExpenses || 0) - (expData.amount || 0),
        updatedAt: serverTimestamp()
      });

      transaction.delete(expenseRef);
    });
  } catch (error) {
    handleFirestoreError(error, 'delete', `/users/${userId}/expenses/${expenseId}`);
  }
};

export const updateSettings = async (userId: string, sO: number, sP: number, sI: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      splitObligations: sO,
      splitPersonal: sP,
      splitInvestment: sI,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `/users/${userId}`);
  }
};

