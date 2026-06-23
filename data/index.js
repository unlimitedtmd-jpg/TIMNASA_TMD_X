const fs = require('fs');
const path = require('path');

// Kuhakikisha faili la data lipo mda wote
const libDir = path.join(__dirname, '../lib');
const filePath = path.join(libDir, 'antilink.json');
if (!fs.existsSync(libDir)) fs.mkdirSync(libDir);
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');

// DB Manager ya kuhifadhi data mda wote kwenye json
const db = {
    load() {
        try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } 
        catch (e) { return {}; }
    },
    save(data) {
        try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); } 
        catch (e) { console.error('Data saving error:', e); }
    },
    get(chatId) {
        const data = this.load();
        return data[chatId] || { enabled: false, action: 'warn', warnings: {} };
    },
    set(chatId, config) {
        const data = this.load();
        data[chatId] = { ...this.get(chatId), ...config };
        this.save(data);
    }
};

// Advanced Regex ya kugundua aina zote za link
function hasLink(text) {
    if (!text) return false;
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-z]{2,3}\/[^\s]+|chat\.whatsapp\.com\/[^\s]+|wa\.me\/[^\s]+|t\.me\/[^\s]+)/gi;
    return urlPattern.test(text);
}

// 1. COMMAND MANAGEMENT (Kuwasha na Kuzima)
async function handleAntilinkCommand(sock, chatId, message, args, isSenderAdmin) {
    if (!isSenderAdmin) {
        return await sock.sendMessage(chatId, { text: "❌ *Amri hii ni ya Admins tu!*" }, { quoted: message });
    }

    const subCommand = args[0]?.toLowerCase();
    const actionParam = args[1]?.toLowerCase() || 'warn';

    if (subCommand === 'on') {
        db.set(chatId, { enabled: true, action: ['kick', 'delete', 'warn'].includes(actionParam) ? actionParam : 'warn' });
        const current = db.get(chatId);
        return await sock.sendMessage(chatId, { 
            text: `🔒 *TIMNASA_TMD-X ANTILINK*\n\n✅ Mfumo umewashwa kwa mafanikio.\n• *Action:* ${current.action.toUpperCase()}\n\n_Viungo vyote vitafutwa kiotomatiki._` 
        }, { quoted: message });
    }

    if (subCommand === 'off') {
        db.set(chatId, { enabled: false, warnings: {} });
        return await sock.sendMessage(chatId, { text: "🔓 *TIMNASA_TMD-X ANTILINK*\n\nMfumo umezimwa. Link sasa zinaruhusiwi." }, { quoted: message });
    }

    if (subCommand === 'status') {
        const current = db.get(chatId);
        return await sock.sendMessage(chatId, { 
            text: `📊 *ANTILINK STATUS*\n\n• *Hali:* ${current.enabled ? '🟢 INAFANYA KAZI' : '🔴 IMEZIMWA'}\n• *Hatua:* ${current.action.toUpperCase()}` 
        }, { quoted: message });
    }

    // Default Help Text
    const helpText = `🔒 *TIMNASA_TMD-X ANTILINK SYSTEM*\n\n` +
                     `*Matumizi ya Amri:*\n` +
                     `• \`.antilink on\` - Washa kidelete tu na kuonya\n` +
                     `• \`.antilink on kick\` - Washa kutoa mtu moja kwa moja\n` +
                     `• \`.antilink off\` - Zima ulinzi\n` +
                     `• \`.antilink status\` - Angalia hali ya ulinzi`;
    await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
}

// 2. DETECTOR LOGIC (Kusoma na Kuchukua Hatua)
async function handleLinkDetection(sock, mek) {
    try {
        const from = mek.key.remoteJid;
        if (!from || !from.endsWith('@g.us')) return; // Inalinda magroup tu

        const config = db.get(from);
        if (!config.enabled) return;

        const sender = mek.key.participant || mek.key.remoteJid;
        if (mek.key.fromMe) return; // Isikate link za bot yenyewe

        // Kusoma kama alietuma ni admin
        const groupMetadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const isSenderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin !== null;
        if (isSenderAdmin) return; // Admins wanaruhusiwa kutuma link

        // Kusoma maandishi yote (hadi caption za picha/video)
        const text = mek.message?.conversation || 
                     mek.message?.extendedTextMessage?.text || 
                     mek.message?.imageMessage?.caption || 
                     mek.message?.videoMessage?.caption || '';

        if (hasLink(text)) {
            // 1. Futa ujumbe wenye link mara moja
            await sock.sendMessage(from, { delete: mek.key }).catch(() => {});

            // 2. Chukua hatua kulingana na mipangilio (Action)
            if (config.action === 'kick') {
                await sock.groupParticipantsUpdate(from, [sender], "remove");
                await sock.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} ametolewa kwenye kikundi kwa kukiuka sheria ya Antilink.`, mentions: [sender] });
            } 
            else if (config.action === 'warn') {
                if (!config.warnings) config.warnings = {};
                config.warnings[sender] = (config.warnings[sender] || 0) + 1;
                db.set(from, { warnings: config.warnings });

                const count = config.warnings[sender];
                if (count >= 3) {
                    // Ukifikisha onyo la 3 unapigwa ban
                    await sock.groupParticipantsUpdate(from, [sender], "remove");
                    config.warnings[sender] = 0;
                    db.set(from, { warnings: config.warnings });
                    await sock.sendMessage(from, { text: `🚨 @${sender.split('@')[0]} ametolewa baada ya kufikisha Onyo la 3/3 la kutuma viungo.`, mentions: [sender] });
                } else {
                    await sock.sendMessage(from, { 
                        text: `⚠️ *TIMNASA ANTILINK DETECTED!*\n\n@${sender.split('@')[0]} Link haziruhusiwi hapa!\n• *Onyo:* ${count}/3\n_(Ukifikisha 3 utatolewa kiotomatiki)_`, 
                        mentions: [sender] 
                    });
                }
            } 
            else {
                // Delete pekee
                await sock.sendMessage(from, { text: `⚠️ Ujumbe wa @${sender.split('@')[0]} umefutwa kwa sababu una kiungo kilichopigwa marufuku.`, mentions: [sender] });
            }
        }
    } catch (e) {
        console.error('Antilink Engine Error:', e);
    }
}

module.exports = { handleAntilinkCommand, handleLinkDetection };
