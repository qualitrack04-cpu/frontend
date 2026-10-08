import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { canCreateCapa } from '../../../shared/utils/role';
import { useCapas } from '../hooks/use_capas';
import { updateCapaStatus, type Capa, type CapaStatus } from '../api/capa_api';
import CapaCard from './capa_card';

export default function CapaPage() {
  const { capas, loading, error } = useCapas();
  const [items, setItems] = useState<Capa[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const allowCreate = canCreateCapa();

  useEffect(() => {
    setItems(capas);
  }, [capas]);

  async function handleStatusChange(id: string, status: CapaStatus) {
    setStatusError(null);
    setUpdatingId(id);
    const prev = items;
    setItems((current) => current.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      await updateCapaStatus(id, status);
    } catch (err: any) {
      setItems(prev);
      setStatusError(err.response?.data?.message ?? 'Gagal mengubah status CAPA.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-full m-0 text-left">
      <div className="flex justify-between items-center mb-[20px] flex-wrap gap-[12px]">
        <h1 className="text-[3rem] font-bold text-[#0f2c52] m-0 tracking-[-0.5px] leading-[1.25]">CAPA</h1>
        {allowCreate && (
          <Link to="/capa/new" className="flex items-center gap-[8px] bg-[#0f2c52] text-white px-[16px] py-[10px] rounded-[8px] no-underline text-[14px] font-semibold hover:bg-[#0c2444]">
            <Plus size={18} /> New CAPA
          </Link>
        )}
      </div>

      {loading && <p className="text-slate-500">Memuat CAPA...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {statusError && <p className="text-red-600">{statusError}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-slate-500">Belum ada CAPA. Tambahkan lewat tombol New CAPA.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[20px]">
        {items.map((capa) => (
          <CapaCard
            key={capa.id}
            capa={capa}
            onStatusChange={handleStatusChange}
            updatingStatus={updatingId === capa.id}
          />
        ))}
      </div>
    </div>
  );
}
