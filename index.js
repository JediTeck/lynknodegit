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
    console.log(`\n🔍 Testing chatbot at ${chatEndpoint}`);
    
    try {
        // Skip GET check since we know POST works
        console.log('Sending POST request with test message...');
        const testMessage = {
            message: "What is Lynk?, from Jediteck 2025",
            timestamp
        };
        console.log('POST request body:', JSON.stringify(testMessage));
        
        const postResponse = await fetch(chatEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testMessage)
        });
        
        console.log('POST response status:', postResponse.status);
        
        if (postResponse.ok) {
            const responseText = await postResponse.text();
            console.log('✅ Chatbot response:', responseText);
            return { 
                url, 
                chatStatus: 'success',
                response: responseText,
                timestamp
            };
        } else {
            const errorText = await postResponse.text();
            const error = `POST check failed with status: ${postResponse.status} - ${errorText}`;
            console.error('❌', error);
            return { 
                url, 
                chatStatus: 'failed',
                error,
                timestamp
            };
        }
    } catch (error) {
        console.error('❌ Error checking chatbot:', error);
        return { 
            url, 
            chatStatus: 'failed',
            error: error.message,
            timestamp
        };
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

    // URLs to check for chatbot
    const chatbotUrls = ['https://jediteck.com/'];

    console.log('🌐 Checking URL availability...');
    const results = await Promise.all(urls.map(checkURL));
    const passed = results.filter(result => result.status === 'success').map(result => result.url);
    const failed = results.filter(result => result.status !== 'success');

    console.log('🤖 Starting chatbot health check...');
    const urlsToCheck = passed.filter(url => chatbotUrls.includes(url));
    console.log(`Found ${urlsToCheck.length} URLs to check for chatbot:`, urlsToCheck);
    
    const chatbotResults = await Promise.all(urlsToCheck.map(checkChatbot));
    console.log('Chatbot check results:', JSON.stringify(chatbotResults, null, 2));
    
    const chatbotPassed = chatbotResults.filter(result => result.chatStatus === 'success');
    const chatbotFailed = chatbotResults.filter(result => result.chatStatus === 'failed');

    // Create a single comprehensive status message
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
    let message = `(${timestamp}) --`;

    // URL Status Section
//    message += `📡 URL Status:\n`;
    if (passed.length > 0) {
        message += ` -- ✅ Online:${passed.map(url => `• ${url}`).join('-')}-`;
    }
    if (failed.length > 0) {
        message += `❌ Offline:\n${failed.map(result => `• ${result.url} (${result.status})`).join('\n')}\n`;
    }

    // Chatbot Status Section
 //   message += `\n🤖 Chatbot Status:\n`;
    if (chatbotPassed.length > 0) {
        chatbotPassed.forEach(result => {
            message += ` - ✅ chatbotOnline`;
//            message += `✅ Response received:\n`;
//            message += `• ${result.response}\n`;
        });
    } else if (chatbotFailed.length > 0) {
        chatbotFailed.forEach(result => {
            message += `❌ Error:\n`;
            message += `• ${result.error}\n`;
        });
    }

    console.log('📝 Final Discord message:', message);
    await sendToDiscord(message);
}

main();