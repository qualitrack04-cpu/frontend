import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createCapaStatus } from '../api/system_config_api';
import ColorPicker from './color_picker';
import { setStatusColor } from '../utils/color_storage';

interface AddCapaStatusModalProps {
  onClose: () => void;
  onSuccess: () => void;
  nextOrderIndex: number;
}

export default function AddCapaStatusModal({
  onClose,
  onSuccess,
  nextOrderIndex,
}: AddCapaStatusModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Status name is required');
      return;
    }
    if (name.trim().length > 50) {
      setError('Status name must be 50 characters or less');
      return;
    }

    setLoading(true);
    try {
      const res = await createCapaStatus({
        name: name.trim(),
        description: description.trim(),
        hexaCode: color,
        orderIndex: nextOrderIndex || 1,
        isTerminal: false,
      });

      // Persist chosen color
      if (res?.id) {
        setStatusColor(res.id, color);
      }
      setStatusColor(name.trim(), color);

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add CAPA status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/40 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center min-h-screen animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[430px] my-auto overflow-hidden p-5 sm:p-6 relative box-border">
        {/* Header */}
        <div className="flex items-start justify-between mb-3.5">
          <div>
            <h2 className="text-[18px] sm:text-[19px] font-bold text-slate-900 tracking-tight m-0 mb-0.5">
              Add CAPA Status
            </h2>
            <p className="text-[12px] sm:text-[12.5px] text-slate-500 m-0 font-normal">
              Create a new CAPA Status and customize its appearance.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors ml-2 shrink-0"
            title="Close"
          >
            <X size={17} />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 text-red-600 text-[12.5px] rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* STATUS NAME */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              STATUS NAME
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Open"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13.5px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border"
                required
              />
            </div>
          </div>

          {/* COLOR */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              COLOR
            </label>
            <ColorPicker color={color} onChange={setColor} showPalette={true} />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              DESCRIPTION
            </label>
            <div className="relative w-full">
              <textarea
                rows={2}
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Assigned & Awaiting root-cause analysis"
                className="w-full font-sans bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none leading-relaxed box-border"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[13px] transition-colors bg-white cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[13px] transition-colors shadow-2xs border-none cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
