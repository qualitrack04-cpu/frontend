import { useState } from 'react';
import { analyzeSpc, type SpcResult } from '../api/spc_api';

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
    usl: '',
    lsl: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file: selectedFile }));
  };

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
    <form onSubmit={handleSubmit} className="spc-form">
      <div className="form-group">
        <label>Upload Excel (.xlsx / .xls)</label>
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} required />
      </div>

      <div className="form-group">
        <label>Product / Parameter Name</label>
        <input
          type="text"
          name="productName"
          placeholder="e.g. Outer Diameter"
          value={formData.productName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Target Value (opsional)</label>
          <input
            type="number"
            step="0.01"
            name="targetValue"
            placeholder="0.00"
            value={formData.targetValue}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Unit</label>
          <select name="unit" value={formData.unit} onChange={handleChange}>
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

      <div className="form-row">
        <div className="form-group">
          <label>LSL (Lower Spec Limit)</label>
          <input
            type="number"
            step="0.01"
            name="lsl"
            placeholder="9.50"
            value={formData.lsl}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>USL (Upper Spec Limit)</label>
          <input
            type="number"
            step="0.01"
            name="usl"
            placeholder="10.50"
            value={formData.usl}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description (opsional)</label>
        <textarea
          name="description"
          placeholder="Catatan tambahan..."
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {error && <p className="spc-error">{error}</p>}

      <button type="submit" className="spc-submit-btn" disabled={submitting}>
        {submitting ? 'Menganalisis...' : 'Analyze'}
      </button>
    </form>
  );
}