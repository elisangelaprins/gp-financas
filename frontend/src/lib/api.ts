const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gp-financas.onrender.com';

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function apiClient<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options;

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/pdf') || contentType.includes('text/csv'))) {
    if (!response.ok) throw new Error('Erro ao baixar o arquivo.');
    return (await response.blob()) as unknown as T;
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || result.message || 'Ocorreu um erro na requisição.');
  }

  return result as T;
}
