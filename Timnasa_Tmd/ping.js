const os = require('os');
const settings = require('../settings.js');

function formatTime(seconds) {
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

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        // Kutuma ujumbe wa kwanza wa majaribio
        const msg = await sock.sendMessage(chatId, { text: '⚡ *Testing system speed...*' }, { quoted: message });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);

        // 1. Kuchukua namba ya aliyetuma amri (Sender JID)
        const sender = message.key.participant || message.key.remoteJid;

        // 2. Kuchukua Picha ya Wasifu ya mtumiaji (User Profile Picture)
        let userPfp;
        try {
            userPfp = await sock.profilePictureUrl(sender, 'image');
        } catch (e) {
            // Picha ya cyberpunk mbadala kama mtumiaji hana pfp au imefichwa
            userPfp = "https://wallpapercave.com/wp/wp6331904.jpg"; 
        }

        // 3. Muonekano mpya wa kisasa (Cyberpunk Style)
        const botInfo = `
⚡ *TIMNASA MULTIPLE BOT SYSTEM* ⚡

┏━━━━━━〔 🤖 STATUS 〕━━━━━━┓
┃ 🌐 Status   : ONLINE
┃ 🚀 Ping     : ${ping} ms
┃ ⏱️ Uptime   : ${uptimeFormatted}
┃ 🔖 Version  : v${settings.version || "1.0.0"}
┃ 🔒 Security : ENCRYPTED
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

_"Breaching limitations, automating the future."_`.trim();

        // 4. Kutuma Picha ya Mtumiaji ikiwa na maelezo ya Bot (Caption)
        await sock.sendMessage(chatId, { 
            image: { url: userPfp }, 
            caption: botInfo 
        }, { quoted: message });

        // 5. Kutuma Music/Audio fupi ya kisasa (Kama Voice Note ya sekunde chache)
        const musicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
        await sock.sendMessage(chatId, {
            audio: { url: musicUrl },
            mimetype: "audio/mp4",
            ptt: true // Inatokea kama sauti iliyorekodiwa hapo hapo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot status.' }, { quoted: message });
    }
}

module.exports = pingCommand;
