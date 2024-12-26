import fetch from 'node-fetch';

async function checkURL(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            console.log(`✅ ${url} is up and running!`);
            return { url, status: 'success' };
        } else {
            console.error(`❌ ${url} returned status: ${response.status}`);
            return { url, status: `failed (status: ${response.status})` };
        }
    } catch (error) {
        console.error(`❌ Error checking ${url}:`, error.message);
        return { url, status: `failed (error: ${error.message})` };
    }
}

async function sendToDiscord(message) {
    const webhookUrl = 'https://discord.com/api/webhooks/1321671942704594945/siKgnPbVB7jTJ2iHAY1s8r6AwY3lpRzL395F5LVyFfUj8Q5PHwLqnEBnjpfvvryYd4Ia';
    //const payload = { content: message };
    const payload = { content: message.replace(/(https?:\/\/\S+)/g, '<$1>') };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log('✅ Message sent successfully to Discord!');
        } else {
            console.error('❌ Failed to send message to Discord:', response.statusText);
        }
    } catch (error) {
        console.error('❌ Error sending message to Discord:', error.message);
    }
}

async function main() {
    const urls = [
        'https://lynkai.jediteck.com/',
        'https://jediteck.com/'
    ];

    const results = await Promise.all(urls.map(checkURL));
    const passed = results.filter(result => result.status === 'success').map(result => result.url);
    const failed = results.filter(result => result.status !== 'success');

    let message = '';

    if (failed.length === 0) {
        message = `✅ All URLs are up and running successfully:\n${passed.join('\n')}`;
    } else {
        message = `⚠️ URL Status Check Results:\n\n✅ Passed:\n${passed.join('\n')}\n\n❌ Failed:\n`;
        failed.forEach(result => {
            message += `${result.url} (${result.status})\n`;
        });
    }

    await sendToDiscord(message);
}

main();