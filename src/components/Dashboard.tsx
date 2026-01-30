import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ComplianceItemWithCategory, ComplianceCategory } from '../types/database';
import { DashboardHeader } from './DashboardHeader';
import { MetricsCards } from './MetricsCards';
import { ComplianceTable } from './ComplianceTable';
import { ComplianceModal } from './ComplianceModal';
import { Plus, Download } from 'lucide-react';
import { exportToCSV } from '../lib/csvExport';
import { checkAndSendNotifications } from '../lib/emailNotifications';

export function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<ComplianceItemWithCategory[]>([]);
  const [categories, setCategories] = useState<ComplianceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ComplianceItemWithCategory | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check for email notifications on data load and periodically
  useEffect(() => {
    if (items.length > 0) {
      checkAndSendNotifications(items).catch(console.error);
    }

    // Check every 5 minutes for notifications
    const interval = setInterval(() => {
      if (items.length > 0) {
        checkAndSendNotifications(items).catch(console.error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [items]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [itemsResult, categoriesResult] = await Promise.all([
        supabase
          .from('compliance_items')
          .select('*, compliance_categories(*)')
          .order('due_date', { ascending: true, nullsFirst: false }),
        supabase.from('compliance_categories').select('*').order('name')
      ]);

      if (itemsResult.data) setItems(itemsResult.data as ComplianceItemWithCategory[]);
      if (categoriesResult.data) setCategories(categoriesResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: ComplianceItemWithCategory) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this compliance item?')) return;

    const { error } = await supabase.from('compliance_items').delete().eq('id', id);

    if (!error) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    loadData();
  };

  const filteredItems = items.filter(item => {
    if (filterCategory !== 'all' && item.category_id !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const handleExportCSV = () => {
    exportToCSV(filteredItems);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Compliance Dashboard
          </h1>
          <p className="text-slate-600">
            Monitor and manage your compliance requirements
          </p>
        </div>

        <MetricsCards items={items} />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Compliance Registry
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="compliant">Compliant</option>
                  <option value="in_progress">In Progress</option>
                  <option value="non_compliant">Non-Compliant</option>
                  <option value="pending">Pending</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  disabled={filteredItems.length === 0}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export to CSV"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>

                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center gap-2 justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </div>
          </div>

          <ComplianceTable
            items={filteredItems}
            loading={loading}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        </div>
      </main>

      {isModalOpen && (
        <ComplianceModal
          item={editingItem}
          categories={categories}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
