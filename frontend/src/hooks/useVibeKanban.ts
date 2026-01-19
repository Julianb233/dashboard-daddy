import useSWR from 'swr';

const VIBE_KANBAN_URL = process.env.NEXT_PUBLIC_VIBE_KANBAN_URL || 'http://localhost:3000';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useVibeKanban() {
  const { data, error, mutate } = useSWR(
    `${VIBE_KANBAN_URL}/api/tasks`,
    fetcher,
    { refreshInterval: 5000 }
  );

  return {
    tasks: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
