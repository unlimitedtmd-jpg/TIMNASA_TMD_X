const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function helpCommand(sock, chatId, message) {
    const sender = message.key.participant || message.key.remoteJid;
    const pushName = message.pushName || "Cyber_User";
    const prefix = settings.prefix || '.'; // Inasoma prefix ya bot yako kiotomatiki

    // ========================================================
    // 1. AUTOMATIC COMMAND SCANNER (Kutafuta amri kiotomatiki)
    // ========================================================
    const commandsDir = path.join(__dirname, '../commands'); // Badilisha kuwa '../plugins' kama folder lina jina hilo
    const categories = {};
    let totalCommands = 0;

    try {
        if (fs.existsSync(commandsDir)) {
            const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
            
            for (const file of files) {
                const commandFile = require(path.join(commandsDir, file));
                
                // Kusoma amri zenye muundo sahihi wa 'pattern'
                if (commandFile && commandFile.pattern) {
                    const category = (commandFile.category || 'MISC').toUpperCase();
                    const cmdName = commandFile.pattern.split('|')[0].trim();
                    
                    if (!categories[category]) {
                        categories[category] = [];
                    }
                    categories[category].push(cmdName);
                    totalCommands++;
                }
            }
        }
    } catch (err) {
        console.error("Error scanning commands directory:", err);
    }

    // ========================================================
    // 2. HEADER YA MENU (Cyberpunk Quantum Style)
    // ========================================================
    let helpMessage = `⚡ ─── 『 *${settings.botName || 'TIMNASA_TMD-X'}* 』 ─── ⚡\n` +
                      `🌐 *[QUANTUM CORE V4.0.0]*\n` +
                      `👤 *Operator:* ${pushName}\n` +
                      `👑 *Developer:* ${settings.botOwner || 'Timnasa Timoth'}\n` +
                      `📊 *Total Loaded Commands:* ${totalCommands}\n` +
                      `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n` +
                      `_“Breaching limitations, automating the future.”_\n`;

    // ========================================================
    // 3. GENERATE ORODHA YA COMMANDS KIOTOMATIKI KWA MAKUNDI
    // ========================================================
    const sortedCategories = Object.keys(categories).sort();
    
    if (sortedCategories.length > 0) {
        for (const cat of sortedCategories) {
            helpMessage += `\n╔════════════════════╗\n` +
                           `      🛸 ${cat} COMMANDS\n` +
                           `╚════════════════════╝\n`;
            
            const sortedCmds = categories[cat].sort();
            for (const cmd of sortedCmds) {
                helpMessage += `➤ ┃ ${prefix}${cmd}\n`;
            }
        }
    } else {
        helpMessage += `\n⚠️ _No automatic commands detected. Check your commands folder path._\n`;
    }

    helpMessage += `\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ TIMNASA TIMOTH © 2026 ⚡`;

    // ========================================================
    // 4. KUTAFUTA PICHA YA WASIFU NA KUTUMA MENU
    // ========================================================
    try {
        let finalImageBuffer;
        
        try {
            // Inapakua picha ya wasifu ya alietuma amri
            const pfpUrl = await sock.profilePictureUrl(sender, 'image');
            const response = await axios.get(pfpUrl, { responseType: 'arraybuffer' });
            finalImageBuffer = Buffer.from(response.data, 'binary');
        } catch (e) {
            // Fallback: Kama mtumiaji hana picha, inasoma picha yako ya default kwenye assets
            const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
            if (fs.existsSync(imagePath)) {
                finalImageBuffer = fs.readFileSync(imagePath);
            }
        }

        // Muundo wa ujumbe kama ulio mbelezwa (Newsletter Style)
        const newsletterConfig = {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363406146813524@newsletter',
                newsletterName: 'Timnasa_Tmd-X',
                serverMessageId: 1
            }
        };

        if (finalImageBuffer) {
            await sock.sendMessage(chatId, {
                image: finalImageBuffer,
                caption: helpMessage,
                contextInfo: newsletterConfig
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: newsletterConfig
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in list command:', error);
        await sock.sendMessage(chatId, { text: helpMessage }, { quoted: message });
    }
}

// Hamisha faili hili ili kuunganishwa na index/handler kuu ya amri zako
module.exports = helpCommand;
