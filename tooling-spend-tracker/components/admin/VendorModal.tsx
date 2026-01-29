'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Vendor } from '@/types';

interface VendorModalProps {
  vendor?: Vendor | null;
  onClose: () => void;
  onSave: () => void;
}

const VendorModal: React.FC<VendorModalProps> = ({ vendor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    monthlyBudget: '',
    category: '',
    alternativeNames: '',
    notes: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        monthlyBudget: vendor.monthlyBudget.toString(),
        category: vendor.category,
        alternativeNames: vendor.alternativeNames.join(', '),
        notes: vendor.notes || '',
        active: vendor.active,
      });
    }
  }, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const alternativeNamesArray = formData.alternativeNames
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const payload = {
        name: formData.name,
        monthlyBudget: Number(formData.monthlyBudget),
        category: formData.category,
        alternativeNames: alternativeNamesArray,
        notes: formData.notes,
        active: formData.active,
      };

      const url = vendor ? `/api/vendors/${vendor.id}` : '/api/vendors';
      const method = vendor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save vendor');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vendor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {vendor ? 'Edit Vendor' : 'Add New Vendor'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
              placeholder="e.g., GitHub, Vercel, OpenAI"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Budget *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyBudget}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                className="input"
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                required
                placeholder="e.g., Development, Analytics"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alternative Names
            </label>
            <input
              type="text"
              value={formData.alternativeNames}
              onChange={(e) => setFormData({ ...formData, alternativeNames: e.target.value })}
              className="input"
              placeholder="Comma-separated (e.g., Github, GitHub Inc)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used for fuzzy matching with Ramp transactions
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={3}
              placeholder="Optional notes about this vendor"
            />
          </div>

          {vendor && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : vendor ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorModal;
