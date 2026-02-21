export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || "Une erreur est survenue");
    throw error;
  }
  return response.json();
}
