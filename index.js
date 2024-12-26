import fetch from 'node-fetch';

async function postToWebhook() {
    const webhookUrl = 'https://discord.com/api/webhooks/1321636462071910431/6W-uefikZv11bzhN3OCBPvrVOP8HAUiB7VMldf6X9RgnJAHAZm3UGINXB_fiGeMr2jZG';
    const payload = {
        content: "Hello from GitHub Actions! This message is sent every 10 minutes.",
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log('Message sent successfully!');
        } else {
            console.error('Failed to send message:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

postToWebhook();