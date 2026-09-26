import { useFetch } from '../../../shared/hooks/use_fetch';
import { getCapa } from '../api/capa_api';

export function useCapaDetail(id: string) {
  const { data, loading, error } = useFetch(() => getCapa(id), [id]);
  return { capa: data, loading, error };
}
