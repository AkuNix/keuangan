import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { CATEGORIES } from '@/lib/utils';
import { Modal, ModalFooter, Button, Input, Select, Badge } from '@/components/ui';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function TransactionModal({
  isOpen,
  onClose,
  editingTx,
  onSubmit,
  submitting,
  initialData = {},
}) {
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    ...initialData,
  });

  useEffect(() => {
    if (isOpen) {
      if (editingTx) {
        setFormData({
          type: editingTx.type,
          amount: editingTx.amount.toString(),
          category: editingTx.category,
          description: editingTx.description || '',
          date: new Date(editingTx.date).toISOString().slice(0, 10),
        });
      } else {
        setFormData({
          type: 'EXPENSE',
          amount: '',
          category: CATEGORIES.EXPENSE[0],
          description: '',
          date: new Date().toISOString().slice(0, 10),
        });
      }
    }
  }, [isOpen, editingTx]);

  useEffect(() => {
    if (formData.type && CATEGORIES[formData.type] && !CATEGORIES[formData.type].includes(formData.category)) {
      setFormData(prev => ({ ...prev, category: CATEGORIES[formData.type][0] }));
    }
  }, [formData.type, formData.category]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: new Date(formData.date).toISOString(),
    });
  };

  const today = formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTx ? 'Edit Transaksi' : 'Transaksi Baru'}
      description={today}
      size="md"
      showClose={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <motion.div
          className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl"
          initial={false}
          animate={{ opacity: 1 }}
        >
          {['INCOME', 'EXPENSE'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange('type', type)}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150',
                formData.type === type
                  ? (type === 'INCOME' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm')
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
              aria-pressed={formData.type === type}
            >
              {type === 'INCOME' ? <ArrowUpRight size={16} strokeWidth={2.5} /> : <ArrowDownRight size={16} strokeWidth={2.5} />}
              {type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </motion.div>

        <Input
          label="Jumlah"
          name="amount"
          type="number"
          min="1"
          step="1000"
          placeholder="0"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          prefix="Rp"
          required
          error={formData.amount && parseFloat(formData.amount) < 1 ? 'Minimal 1' : undefined}
          className="font-mono font-semibold text-lg"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Kategori"
            name="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            options={CATEGORIES[formData.type].map(c => ({ value: c, label: c }))}
            required
          />

          <Input
            label="Tanggal"
            name="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>

        <Input
          label="Keterangan"
          name="description"
          type="text"
          placeholder="Catatan opsional..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          maxLength={100}
        />

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" variant={formData.type === 'INCOME' ? 'success' : 'danger'} loading={submitting}>
            {editingTx ? 'Simpan Perubahan' : 'Catat Transaksi'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, transaction, loading }) {
  if (!transaction) return null;

  const isIncome = transaction.type === 'INCOME';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Transaksi"
      description="Tindakan ini tidak dapat dibatalkan"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', isIncome ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30')}>
            {isIncome ? <ArrowUpRight size={20} className="text-emerald-500" /> : <ArrowDownRight size={20} className="text-rose-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 dark:text-white truncate">{transaction.description || 'Tanpa keterangan'}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
              <Badge variant={isIncome ? 'income' : 'expense'} size="sm">{transaction.category}</Badge>
              <span className="font-mono">{formatDate(transaction.date)}</span>
            </div>
          </div>
          <span className={cn('font-mono font-bold text-lg', isIncome ? 'text-emerald-600' : 'text-rose-600')}>
            {isIncome ? '+' : '-'}{transaction.amount.toLocaleString('id-ID')}
          </span>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Yakin ingin menghapus transaksi ini? Data akan hilang permanen.
        </p>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Hapus
        </Button>
      </ModalFooter>
    </Modal>
  );
}