import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  load: () => Promise<T>;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  children: (data: T) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  load,
  emptyMessage,
  isEmpty,
  children,
}: Props<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    load()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unknown error');
      });
    return () => {
      active = false;
    };
  }, [load]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert">Unable to load {title}: {error}</p>
        ) : data === undefined ? (
          <p role="status">Loading {title}...</p>
        ) : isEmpty(data) ? (
          <p>{emptyMessage}</p>
        ) : (
          children(data)
        )}
      </div>
    </section>
  );
}
