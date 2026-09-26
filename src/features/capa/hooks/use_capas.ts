import { useFetch } from '../../../shared/hooks/use_fetch';
import { getCapas, type Capa } from '../api/capa_api';

const EMPTY_CAPAS: Capa[] = [];

export function useCapas() {
  const { data, loading, error } = useFetch(() => getCapas());
  return { capas: data ?? EMPTY_CAPAS, loading, error };
}
