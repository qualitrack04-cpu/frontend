import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCapas } from '../hooks/use_capas';
import { updateCapaStatus, type Capa, type CapaStatus } from '../api/capa_api';
import CapaCard from './capa_card';

export default function CapaPage() {
  const { capas, loading, error } = useCapas();
  const [items, setItems] = useState<Capa[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Salin ke state lokal supaya perubahan status (dropdown di card) bisa
  // langsung tampil (optimistic update) tanpa refetch seluruh list.
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
    <div className="page-container capa-page">
      <div className="capa-list-header">
        <h1 className="capa-title">CAPA</h1>
        <Link to="/capa/new" className="capa-btn-primary">
          <Plus size={18} /> New CAPA
        </Link>
      </div>

      {loading && <p className="text-muted">Memuat CAPA...</p>}
      {error && <p className="error-text">{error}</p>}
      {statusError && <p className="error-text">{statusError}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-muted">Belum ada CAPA. Tambahkan lewat tombol New CAPA.</p>
      )}

      <div className="capa-card-grid">
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
