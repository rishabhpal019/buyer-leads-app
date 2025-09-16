'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [inserted, setInserted] = useState<number | null>(null);
  const router = useRouter();

  async function submit(e:any) {
    e.preventDefault();
    if (!file) return alert('Choose CSV file');
    const text = await file.text();
    const res = await fetch('/api/buyers/import', { method: 'POST', body: text });
    const j = await res.json();
    if (res.ok) {
      setErrors(j.errors || []); setInserted(j.inserted || 0);
      if ((j.inserted || 0) > 0) router.push('/buyers');
    } else {
      alert('Import failed: '+(j.error||'unknown'));
    }
  }

  return (
    <div>
      <h2>CSV Import</h2>
      <form onSubmit={submit}>
        <div><input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0] ?? null)} /></div>
        <div style={{ marginTop:10 }}><button type="submit">Upload</button></div>
      </form>
      {inserted !== null && <div>Inserted: {inserted}</div>}
      {errors && errors.length>0 && (
        <div>
          <h3>Errors</h3>
          <table border={1} cellPadding={6}><thead><tr><th>Row</th><th>Message</th></tr></thead>
            <tbody>{errors.map((er:any,i:number)=>(<tr key={i}><td>{er.row}</td><td><pre>{er.message}</pre></td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
