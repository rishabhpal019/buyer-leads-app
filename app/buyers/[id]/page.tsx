'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyerClient({ params }: any) {
  const id = params.id;
  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function load() {
    setError(''); setLoading(true);
    const res = await fetch(`/api/buyers/${id}`);
    if (res.ok) {
      setBuyer(await res.json());
    } else {
      setError('Failed to load');
    }
    setLoading(false);
  }

  // load once
  if (!buyer && !loading) load();

  async function save(e:any) {
    e.preventDefault();
    setError('');
    const form = e.target;
    const payload = {
      fullName: form.fullName.value,
      email: form.email.value || undefined,
      phone: form.phone.value,
      city: form.city.value,
      propertyType: form.propertyType.value,
      bhk: form.bhk.value || undefined,
      purpose: form.purpose.value,
      budgetMin: form.budgetMin.value ? Number(form.budgetMin.value) : undefined,
      budgetMax: form.budgetMax.value ? Number(form.budgetMax.value) : undefined,
      timeline: form.timeline.value,
      source: form.source.value,
      notes: form.notes.value || undefined,
      tags: form.tags.value ? form.tags.value.split(',').map((s:string)=>s.trim()).filter(Boolean) : [],
      updatedAt: buyer.updatedAt
    };
    const res = await fetch(`/api/buyers/${id}`, { method: 'PATCH', headers: {'content-type':'application/json'}, body: JSON.stringify(payload) });
    if (res.ok) {
      router.refresh(); router.push('/buyers');
    } else {
      const j = await res.json(); setError(j.error || 'Failed to save');
      if (res.status === 409) alert('Record changed, please refresh the page before editing.');
    }
  }

  async function del() {
    if (!confirm('Delete this lead?')) return;
    const res = await fetch(`/api/buyers/${id}`, { method: 'DELETE' });
    if (res.ok) router.push('/buyers');
    else { const j = await res.json(); alert('Delete failed: '+ (j.error||'')); }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div role="alert">{error}</div>;
  if (!buyer) return null;

  return (
    <div>
      <h2>Edit: {buyer.fullName}</h2>
      <form onSubmit={save}>
        <div><label>Full name<input name="fullName" defaultValue={buyer.fullName} required /></label></div>
        <div><label>Email<input name="email" defaultValue={buyer.email ?? ''} /></label></div>
        <div><label>Phone<input name="phone" defaultValue={buyer.phone} required /></label></div>
        <div><label>City<select name="city" defaultValue={buyer.city}><option>Chandigarh</option><option>Mohali</option><option>Zirakpur</option><option>Panchkula</option><option>Other</option></select></label></div>
        <div><label>Property<select name="propertyType" defaultValue={buyer.propertyType}><option>Apartment</option><option>Villa</option><option>Plot</option><option>Office</option><option>Retail</option></select></label></div>
        <div><label>BHK<input name="bhk" defaultValue={buyer.bhk ?? ''} /></label></div>
        <div><label>Purpose<select name="purpose" defaultValue={buyer.purpose}><option>Buy</option><option>Rent</option></select></label></div>
        <div><label>Budget Min<input name="budgetMin" defaultValue={buyer.budgetMin ?? ''} /></label></div>
        <div><label>Budget Max<input name="budgetMax" defaultValue={buyer.budgetMax ?? ''} /></label></div>
        <div><label>Timeline<select name="timeline" defaultValue={buyer.timeline}><option>0-3m</option><option>3-6m</option><option>>6m</option><option>Exploring</option></select></label></div>
        <div><label>Source<select name="source" defaultValue={buyer.source}><option>Website</option><option>Referral</option><option>Walk-in</option><option>Call</option><option>Other</option></select></label></div>
        <div><label>Notes<textarea name="notes" defaultValue={buyer.notes ?? ''} /></label></div>
        <div><label>Tags (comma separated)<input name="tags" defaultValue={(buyer.tags||[]).join(', ')} /></label></div>
        <div><small>Last updated: {new Date(buyer.updatedAt).toLocaleString()}</small></div>
        <div style={{ marginTop: 10 }}><button type="submit">Save</button> <button type="button" onClick={del}>Delete</button></div>
      </form>

      <h3>History (last 5)</h3>
      <ul>
        {buyer && buyer.id ? buyer.historyPreview?.map((h:any)=>(<li key={h.id}>{new Date(h.changedAt).toLocaleString()} - {JSON.stringify(h.diff)}</li>)) : null}
      </ul>
    </div>
  );
}
