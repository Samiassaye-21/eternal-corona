import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// ─── Juice-business inventory with real items ───
const defaultInventory = [
    // Fruits
    { id: 'mango', name: 'Mango', category: 'Fruits', emoji: '🥭', unit: 'kg', totalStock: 0, used: 0, wasted: 0, lowThreshold: 5 },
    { id: 'banana', name: 'Banana', category: 'Fruits', emoji: '🍌', unit: 'kg', totalStock: 0, used: 0, wasted: 0, lowThreshold: 5 },
    { id: 'papaya', name: 'Papaya', category: 'Fruits', emoji: '🍈', unit: 'kg', totalStock: 0, used: 0, wasted: 0, lowThreshold: 3 },
    { id: 'avocado', name: 'Avocado', category: 'Fruits', emoji: '🥑', unit: 'kg', totalStock: 0, used: 0, wasted: 0, lowThreshold: 3 },
    { id: 'orange', name: 'Orange', category: 'Fruits', emoji: '🍊', unit: 'kg', totalStock: 0, used: 0, wasted: 0, lowThreshold: 5 },
    { id: 'pineapple', name: 'Pineapple', category: 'Fruits', emoji: '🍍', unit: 'pcs', totalStock: 0, used: 0, wasted: 0, lowThreshold: 3 },
    { id: 'watermelon', name: 'Watermelon', category: 'Fruits', emoji: '🍉', unit: 'pcs', totalStock: 0, used: 0, wasted: 0, lowThreshold: 2 },
    { id: 'guava', name: 'Guava', category: 'Fruits', emoji: '🍐', unit: 'kg', totalStock: 0, used: 0, wasted: 0, lowThreshold: 3 },
    // Drinks / Extras
    { id: 'chocolate', name: 'Chocolate', category: 'Drinks & Extras', emoji: '🍫', unit: 'pcs', totalStock: 0, used: 0, wasted: 0, lowThreshold: 5 },
    { id: 'vinto', name: 'Vinto', category: 'Drinks & Extras', emoji: '🥤', unit: 'bottles', totalStock: 0, used: 0, wasted: 0, lowThreshold: 3 },
    { id: 'milk', name: 'Milk', category: 'Drinks & Extras', emoji: '🥛', unit: 'liters', totalStock: 0, used: 0, wasted: 0, lowThreshold: 5 },
    { id: 'sugar', name: 'Sugar', category: 'Drinks & Extras', emoji: '🧂', unit: 'kg', totalStock: 0, used: 0, wasted: 0, lowThreshold: 3 },
    { id: 'honey', name: 'Honey', category: 'Drinks & Extras', emoji: '🍯', unit: 'bottles', totalStock: 0, used: 0, wasted: 0, lowThreshold: 2 },
    // Supplies
    { id: 'cups', name: 'Cups', category: 'Supplies', emoji: '🥤', unit: 'pcs', totalStock: 0, used: 0, wasted: 0, lowThreshold: 50 },
    { id: 'lids', name: 'Lids', category: 'Supplies', emoji: '🔵', unit: 'pcs', totalStock: 0, used: 0, wasted: 0, lowThreshold: 50 },
    { id: 'straws', name: 'Straws', category: 'Supplies', emoji: '🥢', unit: 'pcs', totalStock: 0, used: 0, wasted: 0, lowThreshold: 50 },
    { id: 'napkins', name: 'Napkins', category: 'Supplies', emoji: '🧻', unit: 'packs', totalStock: 0, used: 0, wasted: 0, lowThreshold: 5 },
];

const initialExpenses = [
    { id: '1', date: new Date().toISOString().split('T')[0], category: 'Restock', amount: 50.00, description: 'Bought oranges' },
];

const initialSales = [
    { id: '1', date: new Date().toISOString().split('T')[0], shift: 'Day', employee: 'Abebe', cupsUsed: 50, beuCups: 5, juicesSold: 45, amount: 45 * 170, cash: 4000, transfer: 3650, pendingCups: 0, dailyExpense: 0 },
    { id: '2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], shift: 'Night', employee: 'Sara', cupsUsed: 40, beuCups: 5, juicesSold: 35, amount: 35 * 170, cash: 2000, transfer: 3000, pendingCups: 3, dailyExpense: 200 },
];

const initialUsage = [];

export function useStore() {
    const [inventory, setInventory] = useState(defaultInventory);
    const [sales, setSales] = useState(initialSales);
    const [expenses, setExpenses] = useState(initialExpenses);
    const [usage, setUsage] = useState(initialUsage);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from Supabase (if configured) or fall back to localStorage once
    useEffect(() => {
        async function loadData() {
            try {
                if (supabase) {
                    const [{ data: invData }, { data: salesData }, { data: expData }, { data: usageData }] =
                        await Promise.all([
                            supabase.from('inventory').select('*'),
                            supabase.from('sales').select('*').order('date', { ascending: false }),
                            supabase.from('expenses').select('*').order('date', { ascending: false }),
                            supabase.from('usage').select('*').order('date', { ascending: false })
                        ]);

                    if (invData && invData.length > 0) {
                        // merge defaults so new items still appear
                        const savedIds = new Set(invData.map(i => i.id));
                        const merged = [...invData];
                        defaultInventory.forEach(def => {
                            if (!savedIds.has(def.id)) merged.push(def);
                        });
                        setInventory(merged);
                    }
                    if (salesData) setSales(salesData);
                    if (expData) setExpenses(expData);
                    if (usageData) setUsage(usageData);
                } else {
                    const invSaved = localStorage.getItem('juicify_inventory');
                    if (invSaved) {
                        const parsed = JSON.parse(invSaved);
                        const savedIds = new Set(parsed.map(i => i.id));
                        const merged = [...parsed];
                        defaultInventory.forEach(def => {
                            if (!savedIds.has(def.id)) merged.push(def);
                        });
                        setInventory(merged);
                    }
                    const salesSaved = localStorage.getItem('juicify_sales');
                    if (salesSaved) setSales(JSON.parse(salesSaved));
                    const expSaved = localStorage.getItem('juicify_expenses');
                    if (expSaved) setExpenses(JSON.parse(expSaved));
                    const usageSaved = localStorage.getItem('juicify_usage');
                    if (usageSaved) setUsage(JSON.parse(usageSaved));
                }
            } catch (e) {
                console.error('Failed to load data', e);
            } finally {
                setIsLoaded(true);
            }
        }

        loadData();
    }, []);

    // Keep browser backup if Supabase is not configured
    useEffect(() => {
        if (!supabase) {
            localStorage.setItem('juicify_inventory', JSON.stringify(inventory));
        }
    }, [inventory]);

    useEffect(() => {
        if (!supabase) {
            localStorage.setItem('juicify_sales', JSON.stringify(sales));
        }
    }, [sales]);

    useEffect(() => {
        if (!supabase) {
            localStorage.setItem('juicify_expenses', JSON.stringify(expenses));
        }
    }, [expenses]);

    useEffect(() => {
        if (!supabase) {
            localStorage.setItem('juicify_usage', JSON.stringify(usage));
        }
    }, [usage]);

    // Derived metrics
    const totalJuicesSold = sales.reduce((sum, sale) => sum + (sale.juicesSold || 0), 0);
    const totalIncome = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    const totalPendingCups = sales.reduce((sum, sale) => sum + (sale.pendingCups || 0), 0);
    const totalPendingAmount = totalPendingCups * 170;
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalShiftExpenses = sales.reduce((sum, sale) => sum + (sale.dailyExpense || 0), 0);
    const netProfit = totalIncome - totalExpenses - totalShiftExpenses;

    // Actions
    const addSale = (sale) => {
        const row = { id: Date.now().toString(), ...sale };
        setSales(prev => [row, ...prev]);

        if (supabase) {
            supabase.from('sales').insert(row).then().catch(console.error);
        }

        // Auto-deduct cups from inventory
        const cupsUsed = Number(sale.cupsUsed) || 0;
        const beuCups = Number(sale.beuCups) || 0;
        if (cupsUsed > 0 || beuCups > 0) {
            setInventory(prev =>
                prev.map(item => {
                    if (item.id === 'cups') {
                        return {
                            ...item,
                            used: item.used + (cupsUsed - beuCups), // actual sold cups
                            wasted: item.wasted + beuCups, // wasted/defect cups
                        };
                    }
                    return item;
                }),
            );
        }

        // Auto-deduct ingredient usage (fruits, milk, etc.)
        if (sale.ingredientsUsed && typeof sale.ingredientsUsed === 'object') {
            setInventory(prev =>
                prev.map(item => {
                    const usedQty = Number(sale.ingredientsUsed[item.id]) || 0;
                    if (!usedQty) return item;

                    const currentUsed = Number(item.used) || 0;
                    const currentWasted = Number(item.wasted) || 0;
                    const totalStock = Number(item.totalStock) || 0;
                    const available = Math.max(0, totalStock - currentUsed - currentWasted);
                    const toUse = Math.min(usedQty, available);

                    return {
                        ...item,
                        used: currentUsed + toUse,
                    };
                }),
            );
        }
    };

    const addExpense = (expense) => {
        const row = { id: Date.now().toString(), ...expense };
        setExpenses(prev => [row, ...prev]);
        if (supabase) {
            supabase.from('expenses').insert(row).then().catch(console.error);
        }
    };

    const addUsage = (usageRecord) => {
        const record = { id: Date.now().toString(), ...usageRecord };
        setUsage(prev => [record, ...prev]);

        if (supabase) {
            supabase.from('usage').insert(record).then().catch(console.error);
        }

        const qty = Number(usageRecord.quantity) || 0;
        if (!qty || !usageRecord.itemId) return;

        setInventory(prev =>
            prev.map(item => {
                if (item.id !== usageRecord.itemId) return item;
                const currentUsed = Number(item.used) || 0;
                const currentWasted = Number(item.wasted) || 0;
                const totalStock = Number(item.totalStock) || 0;
                const available = Math.max(0, totalStock - currentUsed - currentWasted);
                const toUse = Math.min(qty, available);
                return {
                    ...item,
                    used: currentUsed + toUse,
                };
            }),
        );
    };

    const resolvePendingSale = (id, paymentDetails) => {
        setSales(prev =>
            prev.map(sale => {
                if (sale.id === id) {
                    const cupsResolved = paymentDetails.cupsResolved || 0;
                    const updated = {
                        ...sale,
                        cash: sale.cash + (paymentDetails.cash || 0),
                        transfer: sale.transfer + (paymentDetails.transfer || 0),
                        pendingCups: Math.max(0, (sale.pendingCups || 0) - cupsResolved)
                    };
                    if (supabase) {
                        supabase.from('sales').update(updated).eq('id', id).then().catch(console.error);
                    }
                    return updated;
                }
                return sale;
            }),
        );
    };

    const updateInventory = (id, updates) => {
        setInventory(prev =>
            prev.map(item => {
                if (item.id !== id) return item;
                const updated = { ...item, ...updates };
                if (supabase) {
                    supabase.from('inventory').upsert(updated).then().catch(console.error);
                }
                return updated;
            }),
        );
    };

    const addInventoryItem = (item) => {
        const row = { id: Date.now().toString(), used: 0, wasted: 0, lowThreshold: 5, emoji: '📦', ...item };
        setInventory(prev => [...prev, row]);
        if (supabase) {
            supabase.from('inventory').insert(row).then().catch(console.error);
        }
    };

    const deleteInventoryItem = (id) => {
        setInventory(prev => prev.filter(item => item.id !== id));
        if (supabase) {
            supabase.from('inventory').delete().eq('id', id).then().catch(console.error);
        }
    };

    return {
        inventory,
        sales,
        expenses,
        usage,
        metrics: {
            totalJuicesSold,
            totalIncome,
            totalPendingCups,
            totalPendingAmount,
            totalExpenses,
            totalShiftExpenses,
            netProfit
        },
        actions: {
            addSale,
            addExpense,
            addUsage,
            resolvePendingSale,
            updateInventory,
            addInventoryItem,
            deleteInventoryItem
        }
    };
}
