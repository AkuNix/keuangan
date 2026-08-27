import { useState } from 'react';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { formatIDR } from '@/lib/utils';
import { Coins, ArrowUpRight } from 'lucide-react';

export function DepositModal({ isOpen, onClose, goal, onSubmit, submitting }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(parseFloat(amount), note || null);
    setAmount('');
    setNote('');
  };

  if (!goal) return null;

  const pct = goal.targetAmount > 0 ? Math.round((goal.totalSaved / goal.targetAmount) * 100) : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.totalSaved);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Setor ke "${goal.name}"`}
      description={`${formatIDR(goal.totalSaved)} dari ${formatIDR(goal.targetAmount)} (${pct}%)`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex items-center justify-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Coins size={24} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Sisa yang dibutuhkan</p>
          <p className="font-mono font-bold text-lg text-slate-900 dark:text-white tabular-nums">{formatIDR(remaining)}</p>
        </div>

        <Input
          label="Jumlah Setor"
          name="amount"
          type="number"
          min="1000"
          step="10000"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          prefix="Rp"
          required
          className="font-mono font-semibold text-lg"
        />

        <Input
          label="Catatan (opsional)"
          name="note"
          type="text"
          placeholder="Contoh: Gajian, bonus, jajan..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
        />

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" variant="success" loading={submitting} disabled={!amount || parseFloat(amount) <= 0}>
            <ArrowUpRight size={16} />
            Setor Sekarang
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}