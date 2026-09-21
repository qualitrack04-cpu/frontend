import axios_instance from '../../../shared/api/axios_instance';

export async function uploadAuditResponseEvidence(responseId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios_instance.post(`/Upload/audit-response/${responseId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}