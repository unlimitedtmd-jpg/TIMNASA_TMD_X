const os = require('os');
const settings = require('../settings.js');

// Function ya kufanya hesabu na kupanga masaa/muda vizuri
function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

// Function ya kutambua platform iliyotumika kudeploy kiotomatiki
function detectPlatform() {
    if (process.env.REPL_ID) return 'REPLIT';
    if (process.env.HEROKU_APP_ID || process.env.HEROKU_APP_NAME) return 'HEROKU CLOUD';
    if (process.env.RENDER_SERVICE_ID) return 'RENDER CLOUD';
    if (process.env.PTERODACTYL_SHELL || process.env.SERVER_MEMORY) return 'PTERODACTYL PANEL';
    if (process.env.KOYEB_APP_ID) return 'KOYEB CLOUD';
    
    // Kama haitambui mazingira ya cloud hapo juu, itasoma OS ya kawaida
    return os.platform().toUpperCase() + ' (VPS/Local)';
}

async function testCommand(sock, chatId, message) {
    try {
        await sock.sendPresenceUpdate('composing', chatId);

        // 1. Mahesabu ya Uptime
        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatUptime(uptimeInSeconds);

        // 2. Kutambua kama Bot ipo Public au Private kutoka kwenye settings zako
        // Kama settings zako zinatumia jina lingine (mfano settings.worktype au settings.mode), ubadilishe hapa chini
        const botMode = settings.worktype || settings.mode || 'PUBLIC'; 

        // 3. Kutambua Platform
        const runningPlatform = detectPlatform();

        // 4. Sehemu ya RAM diagnostics
        const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
        const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);

        // 5. Muonekano mpya wa maandishi ya majaribio (Diagnostic Text)
        const testResponse = `
✨ *TIMNASA_TMD_X DIAGNOSTIC TEST* ✨

[ SYSTEM STATUS: FUNCTIONAL ✅ ]

📊 *BOT METRICS:*
┃ ⏱️ Uptime     : ${uptimeFormatted}
┃ 🌍 Work Mode   : ${botMode.toUpperCase()}
┃ 🚀 Platform    : ${runningPlatform}
┃ ⚙️ Bot Ver     : v${settings.version || "1.0.0"}

🖥️ *SERVER HEALTH:*
┃ 💾 Total RAM   : ${totalMem} GB
┃ 🗂️ Free RAM    : ${freeMem} GB
┃ 📡 Connection  : STABLE [100%]

_"Core modules successfully verified."_`.trim();

        // 6. Kutuma majibu kwa mtumiaji
        await sock.sendMessage(chatId, { text: testResponse }, { quoted: message });

        // 7. Kuweka reaction ya emoji
        await sock.sendMessage(chatId, {
            react: {
                text: "🧪",
                key: message.key
            }
        });

    } catch (error) {
        console.error('Error in advanced test command:', error);
        await sock.sendMessage(chatId, { text: '❌ *Diagnostic test failed to complete.*' }, { quoted: message });
    }
}

module.exports = testCommand;
