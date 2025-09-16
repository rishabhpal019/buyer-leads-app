'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: any) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div role="alert" style={{ padding:20 }}>
      <h2>Something went wrong</h2>
      <pre>{String(error?.message || error)}</pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
