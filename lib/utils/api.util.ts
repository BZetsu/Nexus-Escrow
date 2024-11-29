import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';

export class ApiService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
    });
  }

  private async request<T>(
    method: string,
    url: string,
    data: unknown = null,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.request({
        method,
        url,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      console.log(error);
      return <T>false;
    }
  }

  async get<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>('GET', url, null, config);
  }

  async post<T>(
    url: string,
    data: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(
    url: string,
    data: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T>(
    url: string,
    data: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>('DELETE', url, null, config);
  }
}

export const backendApi = new ApiService(
  'https://new-nexus-platform-backend.onrender.com/api/v1'
);

interface UserInfoResponse {
  data: {
    image: string;
    name: string;
    // add other fields as needed
  };
}

export const getUserInfo = async (walletAddress: string): Promise<UserInfoResponse | null> => {
  try {
    const response = await backendApi.get<UserInfoResponse>(`/nexus-user/${walletAddress}`);
    return response;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

const cache = new Map();

export const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetcher();
  cache.set(key, data);
  return data;
};

export interface EscrowResponse {
  data: Array<{
    escrowAddress: string;
    private: boolean;
    createdAt: string; // ISO date string from backend
    contactName: string;
  }>;
}
