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

  try {
    // Prefer /admin/users which includes ProfilePhotoUrl, full role names, search, and status
    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  } catch (err: any) {
    // Fallback: /users
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  }
}

export async function getUserById(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    }
    throw err;
  }
}

export async function updateUser(id: string, data: { fullName: string; email: string }): Promise<void> {
  try {
    await api.put(`/users/${id}`, data);
  } catch (err: any) {
    if (err.response?.status === 404) {
      await api.put(`/admin/users/${id}`, data);
      return;
    }
    throw err;
  }
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  try {
    await api.patch(`/users/${id}/role`, { role });
  } catch (err: any) {
    if (err.response?.status === 404) {
      await api.patch(`/admin/users/${id}/role`, { role });
      return;
    }
    throw err;
  }
}

export async function updateUserStatus(id: string, status: string): Promise<void> {
  try {
    await api.patch(`/users/${id}/status`, { status });
  } catch (err: any) {
    if (err.response?.status === 404) {
      await api.patch(`/admin/users/${id}/status`, { status });
      return;
    }
    throw err;
  }
}
