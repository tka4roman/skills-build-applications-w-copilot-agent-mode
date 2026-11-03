// Relative /api paths go through the Vite dev proxy, so port 8000 never needs to be public.
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

async function responseError(response: Response): Promise<Error> {
  const fallback = `Request failed with ${response.status}`;
  let detail: string | undefined;

  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null) {
      if ('error' in body && typeof body.error === 'string') detail = body.error;
      else if ('message' in body && typeof body.message === 'string') detail = body.message;
    }
  } catch (cause) {
    if (!(cause instanceof SyntaxError)) throw cause;
  }

  const message = detail?.trim();
  return new Error(message ? `${fallback}: ${message}` : fallback);
}

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) throw await responseError(response);
  return response.json() as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await responseError(response);
  return response.json() as Promise<T>;
}
