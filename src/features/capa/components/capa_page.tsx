import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { canCreateCapaFor } from '../../../shared/utils/role';
import { useRole } from '../../../shared/context/role_context';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { getCapas, updateCapaStatus, type Capa } from '../api/capa_api';
import {
  getCapaStatuses,
  getFindingCategories,
  type CapaStatusItem,
  type FindingCategoryItem,
} from '../../system_configuration/api/system_config_api';
import CapaCard from './capa_card';

export default function CapaPage() {
  const { data, loading, error } = useFetch(async () => {
    const [capasData, capaStatuses, categories] = await Promise.all([
      getCapas(),
      getCapaStatuses().catch(() => [] as CapaStatusItem[]),
      getFindingCategories().catch(() => [] as FindingCategoryItem[]),
    ]);

    const colorMap: Record<string, string> = {};
    if (Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.name && cat.hexaCode) {
          const key = cat.name.toLowerCase().replace(/[\s_-]/g, '');
          colorMap[key] = cat.hexaCode;
          colorMap[cat.name.toLowerCase()] = cat.hexaCode;
          if (cat.id) {
            colorMap[cat.id] = cat.hexaCode;
          }
        }
      }
    }

    return {
      capas: capasData || [],
      availableStatuses: capaStatuses || [],
      colorMap,
    };
  });

  const [items, setItems] = useState<Capa[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const { role } = useRole();
  const allowCreate = canCreateCapaFor(role);

  useEffect(() => {
    if (data?.capas) {
      setItems(data.capas);
    }
  }, [data?.capas]);

  async function handleStatusChange(id: string, newStatusName: string, newStatusId: string) {
    setStatusError(null);
    setUpdatingId(id);
    const prev = items;
    setItems((current) =>
      current.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatusName,
              statusName: newStatusName,
              statusId: newStatusId,
            }
          : c
      )
    );
    try {
      await updateCapaStatus(id, newStatusId);
    } catch (err: any) {
      setItems(prev);
      setStatusError(err.response?.data?.message ?? 'Failed to update CAPA status.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-full m-0 text-left">
      <div className="flex justify-between items-center mb-[20px] flex-wrap gap-[12px]">
        <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">CAPA</h1>
        {allowCreate && (
          <Link
            to="/capa/new"
            className="flex items-center gap-[8px] bg-[#0f2c52] text-white px-[16px] py-[10px] rounded-[8px] no-underline text-[14px] font-semibold hover:bg-[#0c2444]"
          >
            <Plus size={18} /> New CAPA
          </Link>
        )}
      </div>

      {loading && <p className="text-slate-500">Loading CAPA...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {statusError && <p className="text-red-600">{statusError}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-slate-500">No CAPAs yet. Add one via New CAPA button.</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-w-0 max-w-full">
        {items.map((capa) => (
          <CapaCard
            key={capa.id}
            capa={capa}
            onStatusChange={handleStatusChange}
            updatingStatus={updatingId === capa.id}
            availableStatuses={data?.availableStatuses}
            categoryColors={data?.colorMap}
          />
        ))}
      </div>
    </div>
  );
}
