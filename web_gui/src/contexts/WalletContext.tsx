import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Wallet, Transaction, Balance } from '../types';
import { walletService } from '../services/walletService';
import toast from 'react-hot-toast';

interface WalletState {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  balances: Balance[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WALLETS'; payload: Wallet[] }
  | { type: 'SET_CURRENT_WALLET'; payload: Wallet | null }
  | { type: 'SET_BALANCES'; payload: Balance[] }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'UPDATE_WALLET'; payload: Wallet }
  | { type: 'DELETE_WALLET'; payload: string };

const initialState: WalletState = {
  wallets: [],
  currentWallet: null,
  balances: [],
  transactions: [],
  isLoading: false,
  error: null,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_WALLETS':
      return { ...state, wallets: action.payload };
    case 'SET_CURRENT_WALLET':
      return { ...state, currentWallet: action.payload };
    case 'SET_BALANCES':
      return { ...state, balances: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_WALLET':
      return { ...state, wallets: [...state.wallets, action.payload] };
    case 'UPDATE_WALLET':
      return {
        ...state,
        wallets: state.wallets.map(w => w.id === action.payload.id ? action.payload : w),
      };
    case 'DELETE_WALLET':
      return {
        ...state,
        wallets: state.wallets.filter(w => w.id !== action.payload),
        currentWallet: state.currentWallet?.id === action.payload ? null : state.currentWallet,
      };
    default:
      return state;
  }
}

interface WalletContextType {
  state: WalletState;
  createWallet: (name: string, password: string) => Promise<void>;
  importWallet: (name: string, seedPhrase: string, password: string) => Promise<void>;
  selectWallet: (walletId: string) => void;
  deleteWallet: (walletId: string) => Promise<void>;
  refreshBalances: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  sendTransaction: (to: string, amount: number, currency: string) => Promise<string>;
  generateAddress: (currency: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    if (state.currentWallet) {
      refreshBalances();
      refreshTransactions();
    }
  }, [state.currentWallet]);

  const loadWallets = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const wallets = await walletService.getWallets();
      dispatch({ type: 'SET_WALLETS', payload: wallets });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load wallets' });
      toast.error('Failed to load wallets');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createWallet = async (name: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const wallet = await walletService.createWallet(name, password);
      dispatch({ type: 'ADD_WALLET', payload: wallet });
      dispatch({ type: 'SET_CURRENT_WALLET', payload: wallet });
      toast.success('Wallet created successfully!');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create wallet' });
      toast.error('Failed to create wallet');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const importWallet = async (name: string, seedPhrase: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const wallet = await walletService.importWallet(name, seedPhrase, password);
      dispatch({ type: 'ADD_WALLET', payload: wallet });
      dispatch({ type: 'SET_CURRENT_WALLET', payload: wallet });
      toast.success('Wallet imported successfully!');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import wallet' });
      toast.error('Failed to import wallet');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectWallet = (walletId: string) => {
    const wallet = state.wallets.find(w => w.id === walletId);
    dispatch({ type: 'SET_CURRENT_WALLET', payload: wallet || null });
  };

  const deleteWallet = async (walletId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await walletService.deleteWallet(walletId);
      dispatch({ type: 'DELETE_WALLET', payload: walletId });
      toast.success('Wallet deleted successfully!');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete wallet' });
      toast.error('Failed to delete wallet');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshBalances = async () => {
    if (!state.currentWallet) return;

    try {
      const balances = await walletService.getBalances(state.currentWallet.id);
      dispatch({ type: 'SET_BALANCES', payload: balances });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh balances' });
      toast.error('Failed to refresh balances');
    }
  };

  const refreshTransactions = async () => {
    if (!state.currentWallet) return;

    try {
      const transactions = await walletService.getTransactions(state.currentWallet.id);
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh transactions' });
      toast.error('Failed to refresh transactions');
    }
  };

  const sendTransaction = async (to: string, amount: number, currency: string) => {
    if (!state.currentWallet) throw new Error('No wallet selected');

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const txHash = await walletService.sendTransaction(
        state.currentWallet.id,
        to,
        amount,
        currency
      );
      await refreshBalances();
      await refreshTransactions();
      toast.success('Transaction sent successfully!');
      return txHash;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send transaction' });
      toast.error('Failed to send transaction');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateAddress = async (currency: string) => {
    if (!state.currentWallet) throw new Error('No wallet selected');

    try {
      const address = await walletService.generateAddress(state.currentWallet.id, currency);
      toast.success('Address generated successfully!');
      return address;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate address' });
      toast.error('Failed to generate address');
      throw error;
    }
  };

  const value: WalletContextType = {
    state,
    createWallet,
    importWallet,
    selectWallet,
    deleteWallet,
    refreshBalances,
    refreshTransactions,
    sendTransaction,
    generateAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
