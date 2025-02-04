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

async function checkChatbot(url) {
    const chatEndpoint = `https://chatlynk.vercel.app/api/chat`;
    const timestamp = new Date().toISOString();
    
    try {
        console.log(`🔍 Sending POST request to chatbot at ${chatEndpoint}...`);
        const testMessage = {
            message: "What is Lynk?, from Jediteck 2025",
            timestamp
        };
        
        const postResponse = await fetch(chatEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testMessage)
        });

        if (postResponse.ok) {
            console.log(`✅ Chatbot responded successfully!`);
            return { url, chatStatus: 'success' };
        } else {
            const errorText = await postResponse.text();
            const error = `POST check failed with status: ${postResponse.status} - ${errorText}`;
            console.error(`❌ ${error}`);
            return { url, chatStatus: 'failed', error };
        }
    } catch (error) {
        console.error('❌ Error checking chatbot:', error);
        return { url, chatStatus: 'failed', error: error.message };
    }
}

async function sendToDiscord(message) {
    const webhookUrl = 'https://discord.com/api/webhooks/1321671942704594945/siKgnPbVB7jTJ2iHAY1s8r6AwY3lpRzL395F5LVyFfUj8Q5PHwLqnEBnjpfvvryYd4Ia';
    const payload = { content: message.replace(/(https?:\/\/\S+)/g, '<$1>') };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            console.log('✅ Failure alert sent to Discord.');
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
    const chatbotUrls = ['https://jediteck.com/'];

    console.log('🌐 Checking URL availability...');
    const results = await Promise.all(urls.map(checkURL));
    const failed = results.filter(result => result.status !== 'success');

    console.log('🤖 Starting chatbot health check...');
    const urlsToCheck = results.filter(result => result.status === 'success' && chatbotUrls.includes(result.url));
    const chatbotResults = await Promise.all(urlsToCheck.map(checkChatbot));
    const chatbotFailed = chatbotResults.filter(result => result.chatStatus === 'failed');

    // If no failures, exit without sending a message
    if (failed.length === 0 && chatbotFailed.length === 0) {
        console.log('✅ All systems operational. No alerts needed.');
        return;
    }

    // If failures exist, build and send a Discord message
    const now = new Date();
    const options = { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Los_Angeles'
    };
    const timestamp = now.toLocaleString('en-US', options) + ' PT';
    let message = `🚨 (${timestamp}) -- Alert: System Issues Detected!\n`;

    if (failed.length > 0) {
        message += `❌ Offline:\n${failed.map(result => `• ${result.url} (${result.status})`).join('\n')}\n`;
    }

    if (chatbotFailed.length > 0) {
        message += `🤖 Chatbot Errors:\n${chatbotFailed.map(result => `• ${result.url} - ${result.error}`).join('\n')}\n`;
    }

    console.log('🚨 Sending failure alert to Discord:', message);
    await sendToDiscord(message);
}

main();
