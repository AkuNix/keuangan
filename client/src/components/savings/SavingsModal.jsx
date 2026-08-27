import { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { Target } from 'lucide-react';

export function SavingsModal({ isOpen, onClose, editingGoal, onSubmit, submitting }) {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setFormData({
          name: editingGoal.name,
          targetAmount: editingGoal.targetAmount.toString(),
          deadline: editingGoal.deadline ? new Date(editingGoal.deadline).toISOString().slice(0, 10) : '',
        });
      } else {
        setFormData({ name: '', targetAmount: '', deadline: '' });
      }
    }
  }, [isOpen, editingGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      deadline: formData.deadline || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGoal ? 'Edit Goal' : 'Goal Tabungan Baru'}
      description="Tentukan nama, target, dan deadline tabunganmu"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex items-center justify-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Target size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <Input
          label="Nama Goal"
          name="name"
          type="text"
          placeholder="Contoh: Beli Laptop, Liburan, Dana Darurat..."
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          maxLength={200}
        />

        <Input
          label="Target Jumlah"
          name="targetAmount"
          type="number"
          min="1000"
          step="10000"
          placeholder="0"
          value={formData.targetAmount}
          onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
          prefix="Rp"
          required
          className="font-mono font-semibold text-lg"
        />

        <Input
          label="Deadline (opsional)"
          name="deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          min={new Date().toISOString().slice(0, 10)}
        />

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {editingGoal ? 'Simpan Perubahan' : 'Buat Goal'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}