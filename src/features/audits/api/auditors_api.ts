import axios_instance from '../../../shared/api/axios_instance';

export interface Auditor {
  id: string;
  fullName: string;
  role: string; 
}

interface ListEnvelope<T> {
  message?: string;
  total: number;
  data: T[];
}

export async function getAuditors(): Promise<Auditor[]> {
  const response = await axios_instance.get<ListEnvelope<Auditor>>('/Auth/auditors');
  return response.data.data;
}