export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  if (!process.env.BREVO_API_KEY) {
    return res.status(500).json({ error: 'BREVO_API_KEY is missing in Vercel Environment Variables' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'MyDoctorG', email: 'apoorvpandeymzp63@gmail.com' },
        to: [{ email: email, name: name }],
        subject: `Welcome to MyDoctorG, ${name}!`,
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; background: #070b14; color: #f8fafc; border-radius: 12px;">
            <h2 style="color: #34d399;">MyDoctorG — AI Health Suite</h2>
            <p>Hello <b>${name}</b>,</p>
            <p>You have successfully logged in to <b>MyDoctorG</b>.</p>
            <p style="color: #94a3b8; font-size: 12px;">Stay healthy and safe!</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Brevo API Error' });
    }

    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}