import { ApiError } from "@/utils/errors";

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

  let response: Response;

  try {

    response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  } catch {

    throw new ApiError('Sem conexão com o servidor. Verifique sua internet.', 0);

  }

  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/pdf') || contentType.includes('text/csv'))) {
    if (!response.ok) throw new Error('Erro ao baixar o arquivo.');
    return (await response.blob()) as unknown as T;
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = result.error || result.message || 'Ocorreu um erro na requisição.';

    throw new ApiError(message, response.status, result.code);

  }

  return result as T;
}
