const apiKey = 're_JbPnNZrQ_8HTocs59m9K61n5q1NhRPgT5';

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
        from: 'PhoneDeals UK <onboarding@resend.dev>',
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
