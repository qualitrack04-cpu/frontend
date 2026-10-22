import api from '../../../shared/api/axios_instance';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  profilePhotoUrl: string | null;
  createdAt: string;
}

export interface GetUsersResponse {
  total: number;
  data: User[];
}

export async function getUsers(search?: string, role?: string, status?: string): Promise<GetUsersResponse> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role) params.append('role', role);
  if (status) params.append('status', status);

  const response = await api.get(`/admin/users?${params.toString()}`);
  return response.data;
}

export async function getUserById(id: string): Promise<User> {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
}

export async function updateUser(id: string, data: { fullName: string; email: string }): Promise<void> {
  await api.put(`/admin/users/${id}`, data);
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  await api.patch(`/admin/users/${id}/role`, { role });
}

export async function updateUserStatus(id: string, status: string): Promise<void> {
  await api.patch(`/admin/users/${id}/status`, { status });
}
