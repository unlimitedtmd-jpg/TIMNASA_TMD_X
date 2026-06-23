const settings = require('../settings');
const fs = require('fs');
const path = require('path');

// Global cache ya commands ili isisome faili upya kila wakati mtu anapo-command
let cachedHelpMessage = '';
let isCacheLoaded = false;

// Kazi hii inarun mara moja tu bot ikiwaka kuandaa orodha ya commands
function preLoadCommands() {
    const commandsDir = path.join(__dirname, '../commands'); // Hakikisha jina la folder ni sahihi
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
        console.error("Error pre-loading commands:", err);
    }

    // Kutengeneza mwili wa ujumbe (Layout ya commands tu)
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

async function helpCommand(sock, chatId, message) {
    // Kama cache haijawa tayari, itapakia haraka hapa
    if (!isCacheLoaded) {
        preLoadCommands();
    }

    const sender = message.key.participant || message.key.remoteJid;
    const pushName = message.pushName || "Cyber_User";

    // Header inayotengenezwa papo hapo kwa sekunde 0 (bila kusubiri)
    let finalMenu = `⚡ ─── 『 *${settings.botName || 'TIMNASA_TMD-X'}* 』 ─── ⚡\n` +
                    `🌐 *[QUANTUM CORE V4.0.0]*\n` +
                    `👤 *Operator:* ${pushName}\n` +
                    `👑 *Developer:* ${settings.botOwner || 'Timnasa Timoth'}\n` + 
                    cachedHelpMessage + 
                    `\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ TIMNASA TIMOTH © 2026 ⚡`;

    try {
        // Tunachukua tu URL ya picha bila kuipakua kupitia axios (Hii inaokoa mda mwingi mno!)
        let menuImageUrl = "https://files.catbox.moe/aapw1p.png"; // Picha yako ya default
        try {
            const pfp = await sock.profilePictureUrl(sender, 'image');
            if (pfp) menuImageUrl = pfp;
        } catch (e) {
            // Kama mtumiaji hana picha, itatumia ile ya default bila kukwama wala kuchelewa
        }

        const newsletterConfig = {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363406146813524@newsletter',
                newsletterName: 'Timnasa_Tmd-X',
                serverMessageId: 1
            }
        };

        // Inatuma picha kwa kutumia URL moja kwa moja - Hii ni INSTANT!
        await sock.sendMessage(chatId, {
            image: { url: menuImageUrl },
            caption: finalMenu,
            contextInfo: newsletterConfig
        }, { quoted: message });

    } catch (error) {
        console.error('Error in instant list command:', error);
        // Fallback ya haraka sana kama picha ikizingua
        await sock.sendMessage(chatId, { text: finalMenu }, { quoted: message });
    }
}

// Pakia commands mapema kabla hata mtu hajasema .list
preLoadCommands();

module.exports = helpCommand;

