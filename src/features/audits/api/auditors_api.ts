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
  try {
    const response = await axios_instance.get<ListEnvelope<Auditor>>('/users/auditors');
    return response.data.data || (Array.isArray(response.data) ? response.data : []);
  } catch (err: any) {
    if (err.response?.status === 404) {
      const response = await axios_instance.get<ListEnvelope<Auditor>>('/auth/auditors');
      return response.data.data || (Array.isArray(response.data) ? response.data : []);
    }
    throw err;
  }
}