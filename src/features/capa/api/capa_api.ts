import axios_instance from '../../../shared/api/axios_instance';

export interface CreateCapaPayload {
  rootCause: string;
  correctiveAction: string;
  preventiveAction?: string;
  deadline: string; 
  picId?: string;
  picName?: string;
}

export async function createCapaFromFinding(findingId: string, payload: CreateCapaPayload) {
  const response = await axios_instance.post(`/Capa/finding/${findingId}`, payload);
  return response.data;
}