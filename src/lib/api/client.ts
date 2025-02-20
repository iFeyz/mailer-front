import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ApiClientConfig {
  baseURL: string
  apiKey: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
}

export class ApiClient {
  protected client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    const axiosConfig: AxiosRequestConfig = {
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        ...config.headers,
        'X-API-Key': config.apiKey,
      },
      withCredentials: config.withCredentials,
    };

    this.client = axios.create(axiosConfig);

    // Add request interceptor to log request details
    this.client.interceptors.request.use((config) => {
      console.log('Request:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data,
        params: config.params
      });
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.log('Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        
        if (error.response) {
          switch (error.response.status) {
            case 401:
              throw new Error('Unauthorized: Please check your API key');
            case 403:
              throw new Error('Forbidden: You do not have access to this resource');
            case 404:
              throw new Error('Resource not found');
            case 400:
              throw new Error(error.response.data.message || 'Bad request');
            case 500:
              throw new Error('Internal server error');
            default:
              throw new Error('An error occurred');
          }
        }
        throw error;
      }
    );
  }

  protected async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.client.get(path, { params });
  }

  protected async post<T>(path: string, data?: any): Promise<T> {
    return this.client.post(path, data);
  }

  protected async put<T>(path: string, data?: any): Promise<T> {
    return this.client.put(path, data);
  }

  protected async delete<T>(path: string): Promise<T> {
    return this.client.delete(path);
  }

  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()))
        } else if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    }

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }
} 