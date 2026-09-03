import { useState } from 'react';

interface SpcFormData {
  file: File | null;
  parameterName: string;
  targetValue: string;
  unit: string;
  productName: string;
  usl: string;
  lsl: string;
  description: string;
}

export default function SpcAnalysisForm() {
  const [formData, setFormData] = useState<SpcFormData>({
    file: null,
    parameterName: '',
    targetValue: '',
    unit: 'mm',
    productName: '',
    usl: '',
    lsl: '',
    description: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      alert('Silakan upload file Excel terlebih dahulu.');
      return;
    }

    // Validasi tambahan: LSL harus lebih kecil dari USL
    const lslNum = parseFloat(formData.lsl);
    const uslNum = parseFloat(formData.usl);
    if (!isNaN(lslNum) && !isNaN(uslNum) && lslNum >= uslNum) {
      alert('LSL harus lebih kecil dari USL.');
      return;
    }

    // Sementara: tampilkan di console dulu, belum kirim ke API (menyusul di langkah berikutnya)
    console.log('Data siap dikirim:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="spc-form">
      <div className="form-group">
        <label>Upload Excel</label>
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} required />
      </div>

      <div className="form-group">
        <label>Parameter Name</label>
        <input
          type="text"
          name="parameterName"
          placeholder="e.g. Outer Diameter"
          value={formData.parameterName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Target Value</label>
          <input
            type="number"
            step="0.01"
            name="targetValue"
            placeholder="0.00"
            value={formData.targetValue}
            onChange={handleChange}
            required
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

      <div className="form-group">
        <label>Product Name</label>
        <input
          type="text"
          name="productName"
          placeholder="Product Diameter"
          value={formData.productName}
          onChange={handleChange}
          required
        />
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
        <label>Description (optional)</label>
        <textarea
          name="description"
          placeholder="Catatan tambahan..."
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Analyze</button>
    </form>
  );
}