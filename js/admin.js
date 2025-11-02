async function saveToServer(){
  // 1) Require ADMIN_SECRET once per session
  if (!window.__ADMIN_KEY__) {
    const k = prompt('Enter admin server key (Vercel ADMIN_SECRET):');
    if (!k) {
      alert('Admin key required.');
      return;
    }
    window.__ADMIN_KEY__ = k;
  }

  // 2) Basic guardrails
  if (!Array.isArray(catalog)) {
    alert('Catalog must be an array. Try reloading admin and adding an item.');
    return;
  }
  const btn = document.getElementById('save-server');
  const origText = btn?.textContent;
  try {
    // 3) Block double-click & show progress
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

    const res = await fetch('/api/catalog', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': window.__ADMIN_KEY__
      },
      body: JSON.stringify(catalog)
    });

    // 4) Read raw body first → then try parse so we can surface server errors clearly
    const raw = await res.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw || 'Unknown error' }; }

    if (!res.ok) {
      // Common helpful messages
      if (res.status === 401) {
        throw new Error(data.error || 'Unauthorized: ADMIN_SECRET mismatch.');
      }
      if (res.status === 500 && /BLOB_READ_WRITE_TOKEN/i.test(data.error || '')) {
        throw new Error('Server missing BLOB_READ_WRITE_TOKEN env var on Vercel.');
      }
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    alert('Saved to server ✅');
  } catch (e) {
    console.error('Save failed:', e);
    alert('Server save failed: ' + (e?.message || e));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = origText || 'Save to server'; }
  }
}
