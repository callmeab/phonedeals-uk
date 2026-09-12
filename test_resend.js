const fs = require('fs');
let apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  try {
    const content = fs.readFileSync('.dev.vars', 'utf8');
    const match = content.match(/RESEND_API_KEY=([^\r\n]+)/);
    if (match) apiKey = match[1].trim();
  } catch (e) {}
}

async function testResend() {
  const emailToSendTo = 'hereab983@gmail.com'; // User's email they tested with

  console.log(`Attempting to send test email to ${emailToSendTo}...`);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mobello.UK <orders@mobello.uk>',
        to: [emailToSendTo],
        subject: 'Test Email from PhoneDeals UK API',
        html: '<p>If you receive this, the API key is working!</p>',
      }),
    });

    const status = response.status;
    const text = await response.text();
    
    console.log(`\nResponse Status: ${status}`);
    if (status === 200) {
      console.log('✅ Success! The email was sent successfully.');
      console.log('Response:', text);
    } else {
      console.log('❌ Failed to send email.');
      console.log('Error from Resend:', text);
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

testResend();
