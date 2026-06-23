const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// Kumbukumbu ya kudumu kwenye RAM (Cache)
let cachedHelpMessage = '';
let isCacheLoaded = false;

// Function inayosoma commands MARA MOJA TU wakati bot inawaka
function preLoadCommands() {
    const commandsDir = path.join(__dirname, '../commands'); 
    const categories = {};
    let totalCommands = 0;
    const prefix = settings.prefix || '.';

    try {
        if (fs.existsSync(commandsDir)) {
            const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
            
            for (const file of files) {
                const commandFile = require(path.join(commandsDir, file));
                if (commandFile && commandFile.pattern) {
                    const category = (commandFile.category || 'MISC').toUpperCase();
                    const cmdName = commandFile.pattern.split('|')[0].trim();
                    
                    if (!categories[category]) categories[category] = [];
                    categories[category].push(cmdName);
                    totalCommands++;
                }
            }
        }
    } catch (err) {
        console.error("Error loading commands into memory:", err);
    }

    // Kutengeneza muundo wa ndani wa menu mapema kabisa
    let bodyText = `📊 *Total Loaded Commands:* ${totalCommands}\n` +
                   `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n` +
                   `_“Breaching limitations, automating the future.”_\n`;

    const sortedCategories = Object.keys(categories).sort();
    for (const cat of sortedCategories) {
        bodyText += `\n╔════════════════════╗\n` +
                    `      🛸 ${cat} COMMANDS\n` +
                    `╚════════════════════╝\n`;
        
        const sortedCmds = categories[cat].sort();
        for (const cmd of sortedCmds) {
            bodyText += `➤ ┃ ${prefix}${cmd}\n`;
        }
    }
    
    cachedHelpMessage = bodyText;
    isCacheLoaded = true;
}

// Hii ndio amri yenyewe ya sekunde 0
async function helpCommand(sock, chatId, message) {
    if (!isCacheLoaded) preLoadCommands();

    const pushName = message.pushName || "Cyber_User";

    // Unakusanya ujumbe mzima papo hapo kutoka kwenye RAM
    let finalMenu = `⚡ ─── 『 *${settings.botName || 'TIMNASA_TMD-X'}* 』 ─── ⚡\n` +
                    `🌐 *[QUANTUM CORE V4.0.0]*\n` +
                    `👤 *Operator:* ${pushName}\n` +
                    `👑 *Developer:* ${settings.botOwner || 'Timnasa Timoth'}\n` + 
                    cachedHelpMessage + 
                    `\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ TIMNASA TIMOTH © 2026 ⚡`;

    // WEKA LINK YA PICHA YAKO HAPA (Direct Link ambayo haichelewi)
    const directImageUrl = "https://files.catbox.moe/aapw1p.png"; 

    const newsletterConfig = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363406146813524@newsletter',
            newsletterName: 'Timnasa_Tmd-X',
            serverMessageId: 1
        }
    };

    // Inarusha ujumbe WhatsApp ndani ya millisekunder chache tu!
    await sock.sendMessage(chatId, {
        image: { url: directImageUrl },
        caption: finalMenu,
        contextInfo: newsletterConfig
    }, { quoted: message }).catch(async () => {
        // Fallback ya haraka zaidi kama picha ikifeli, inatuma text tu ndani ya sekunde 0.1
        await sock.sendMessage(chatId, { text: finalMenu }, { quoted: message });
    });
}

// Run pre-load mapema kabisa kabla hata mtu hajatype amri
preLoadCommands();

module.exports = helpCommand;
