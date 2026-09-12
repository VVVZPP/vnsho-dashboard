export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, action } = req.body;
  const brevoKey = process.env.BREVO_API_KEY;
  const brevoListId = parseInt(process.env.BREVO_LIST_ID || '2');
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@worldmobilityforum.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'World Mobility Forum';
  const secret = process.env.PIN_SECRET || 'wmf-default-secret-change-me';
  if (action === 'send-pin') {
    if (!email || !email.includes('@') || !email.includes('.')) return res.status(400).json({ error: 'Invalid email address' });
    const domain = email.split('@')[1].toLowerCase();
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const crypto = await import('crypto');
    const pinHash = crypto.createHmac('sha256', secret).update(email + pin).digest('hex');
    const pinExpiry = Date.now() + 10 * 60 * 1000;
    if (brevoKey) {
      try {
        const company = domain.split('.')[0];
        await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST', headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, listIds: [brevoListId], updateEnabled: true, attributes: { COMPANY: company, DOMAIN: domain, SOURCE: 'WMF Dashboard', SIGNUP_DATE: new Date().toISOString().split('T')[0], LAST_LOGIN: new Date().toISOString() } }),
        });
        const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST', headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: { name: senderName, email: senderEmail }, to: [{ email }], subject: `Your World Mobility Forum verification PIN: ${pin}`, htmlContent: `<div style="font-family:Arial;max-width:480px;margin:0 auto;padding:40px 24px;"><div style="text-align:center;margin-bottom:32px;"><div style="font-size:20px;font-weight:700;color:#08244B;">WORLD MOBILITY FORUM</div></div><div style="background:#F7F8FA;border-radius:16px;padding:32px;text-align:center;border:1px solid #E5E8EC;"><div style="font-size:14px;color:#5B6470;margin-bottom:12px;">Your verification PIN</div><div style="font-size:42px;font-weight:800;color:#22C8C8;letter-spacing:10px;">${pin}</div></div></div>`, tags: ['wmf-pin'] }),
        });
        if (!emailRes.ok) return res.status(500).json({ error: 'Failed to send verification email.' });
      } catch (err) { console.error(err); }
    }
    return res.status(200).json({ success: true, pinHash, pinExpiry, message: brevoKey ? 'PIN sent' : 'Demo mode', ...(brevoKey ? {} : { pin }) });
  }
  if (action === 'verify-pin') {
    const { pinHash: clientHash, pin: clientPin, pinExpiry: clientExpiry } = req.body;
    if (clientExpiry && Date.now() > clientExpiry) return res.status(400).json({ success: false, verified: false, error: 'PIN expired.' });
    const crypto = await import('crypto');
    const expectedHash = crypto.createHmac('sha256', secret).update(email + clientPin).digest('hex');
    if (expectedHash === clientHash) return res.status(200).json({ success: true, verified: true });
    return res.status(400).json({ success: false, verified: false, error: 'Incorrect PIN.' });
  }
  return res.status(400).json({ error: 'Invalid action' });
}
