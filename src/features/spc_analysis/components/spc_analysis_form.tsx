import { useState } from 'react';
import { analyzeSpc, type SpcResult } from '../api/spc_api';
import { FileText, X } from 'lucide-react';

interface Props {
  onResult: (result: SpcResult) => void;
}

interface SpcFormData {
  file: File | null;
  productName: string;
  targetValue: string;
  unit: string;
  usl: string;
  lsl: string;
  description: string;
}

export default function SpcAnalysisForm({ onResult }: Props) {
  const [formData, setFormData] = useState<SpcFormData>({
    file: null,
    productName: '',
    targetValue: '',
    unit: 'mm',
    usl: '0.5',
    lsl: '-0.5',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file: selectedFile }));
  };
  
  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.file) {
      setError('Silakan upload file Excel terlebih dahulu.');
      return;
    }

    const lsl = parseFloat(formData.lsl);
    const usl = parseFloat(formData.usl);
    if (isNaN(lsl) || isNaN(usl)) {
      setError('LSL dan USL harus berupa angka.');
      return;
    }
    if (lsl >= usl) {
      setError('LSL harus lebih kecil dari USL.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await analyzeSpc({
        file: formData.file,
        productName: formData.productName,
        lsl,
        usl,
        target: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
        unit: formData.unit || undefined,
        description: formData.description || undefined,
      });
      onResult(result);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal melakukan analisis. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[12px] border border-[#e2e8f0] p-[24px]">
      <div className="flex flex-col gap-[8px] mb-[20px]">
        <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Upload Excel (.xlsx / .xls)</label>
        
        {!formData.file ? (
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleFileChange} 
            required 
            className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border file:mr-[16px] file:py-[8px] file:px-[16px] file:rounded-[6px] file:border-0 file:text-[13.5px] file:font-semibold file:bg-[#f1f5f9] file:text-[#475569] hover:file:bg-[#e2e8f0] file:cursor-pointer" 
          />
        ) : (
          <div className="flex items-center justify-between p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] bg-[#f8fafc]">
            <div className="flex items-center gap-[8px] overflow-hidden">
              <FileText size={18} className="text-[#0f2c52] shrink-0" />
              <span className="text-[14px] text-[#1e293b] truncate font-medium">{formData.file.name}</span>
            </div>
            <button 
              type="button" 
              onClick={handleRemoveFile}
              className="bg-transparent border-none p-[4px] cursor-pointer text-[#64748b] hover:text-[#dc2626] flex items-center justify-center shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-[8px] mb-[20px]">
        <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Product / Parameter Name</label>
        <input
          type="text"
          name="productName"
          placeholder="e.g. Outer Diameter"
          value={formData.productName}
          onChange={handleChange}
          required
          className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border placeholder:text-[#94a3b8] font-inherit"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-[16px] mb-[20px]">
        <div className="flex-1 flex flex-col gap-[8px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Target Value (opsional)</label>
          <input
            type="number"
            step="0.01"
            name="targetValue"
            placeholder="0.00"
            value={formData.targetValue}
            onChange={handleChange}
            className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border placeholder:text-[#94a3b8] font-inherit"
          />
        </div>

        <div className="flex-1 flex flex-col gap-[8px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Unit</label>
          <select name="unit" value={formData.unit} onChange={handleChange} className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border font-inherit">
            <option value="mm">mm</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="mL">mL</option>
            <option value="L">L</option>
            <option value="°C">°C</option>
            <option value="%">%</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-[16px] mb-[20px]">
        <div className="flex-1 flex flex-col gap-[8px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">LSL (Lower Spec Limit)</label>
          <input
            type="number"
            step="0.01"
            name="lsl"
            placeholder="-0.5"
            value={formData.lsl}
            onChange={handleChange}
            required
            className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border placeholder:text-[#94a3b8] font-inherit"
          />
        </div>

        <div className="flex-1 flex flex-col gap-[8px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">USL (Upper Spec Limit)</label>
          <input
            type="number"
            step="0.01"
            name="usl"
            placeholder="0.5"
            value={formData.usl}
            onChange={handleChange}
            required
            className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border placeholder:text-[#94a3b8] font-inherit"
          />
        </div>
      </div>

      <div className="flex flex-col gap-[8px] mb-[20px]">
        <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Description (opsional)</label>
        <textarea
          name="description"
          placeholder="Catatan tambahan..."
          value={formData.description}
          onChange={handleChange}
          className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border placeholder:text-[#94a3b8] font-inherit resize-y"
        />
      </div>

      {error && <p className="text-[#dc2626] bg-[#fef2f2] p-[12px_16px] rounded-[8px] border border-[#fecaca] text-[14px] mb-[20px]">{error}</p>}

      <button type="submit" className="bg-[#0f2c52] text-white border-none p-[14px] rounded-[8px] text-[15px] font-semibold w-full cursor-pointer transition-all duration-200 hover:bg-[#0c2444] disabled:opacity-70 disabled:cursor-not-allowed mt-[12px]" disabled={submitting}>
        {submitting ? 'Menganalisis...' : 'Analyze'}
      </button>
    </form>
  );
}