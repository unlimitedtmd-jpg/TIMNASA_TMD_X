const config = require('../config');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');

// =====================
// Simple Greeting Logic
// =====================
const getGreeting = () => {
    const hour = moment().tz('Africa/Nairobi').hour();

    if (hour >= 5 && hour < 12) return "Good Morning 🌅";
    if (hour >= 12 && hour < 17) return "Good Afternoon ☀️";
    if (hour >= 17 && hour < 21) return "Good Evening 🌆";
    return "Good Night 😴";
};

// =====================
// MENU COMMAND
// =====================
cmd({
    pattern: "menu2",
    alias: ["help2", "allmenu2"],
    react: "✨",
    category: "main",
    desc: "Show bot menu",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushName, reply }) => {

    try {
        // 1. Kutengeneza Quoted Message ya vCard iliyo salama
        const fakevCard = {
            key: {
                fromMe: false,
                participant: sender, 
                remoteJid: from
            },
            message: {
                contactMessage: {
                    displayName: pushName || "User",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${pushName || "User"}\nEND:VCARD`
                }
            }
        };

        // 2. Kuchukua Picha ya Wasifu (User Profile Picture) au Group Pfp
        let menuImage;
        try {
            menuImage = await conn.profilePictureUrl(sender, 'image');
        } catch (e) {
            // Picha mbadala ya Catbox isipopatikana ya mtumiaji
            menuImage = "https://files.catbox.moe/aapw1p.png"; 
        }

        const now = moment().tz("Africa/Nairobi");
        const date = now.format("DD/MM/YYYY");
        const time = now.format("HH:mm:ss");

        // Kurekebisha tatizo la conn.getName linalofeli mara nyingi
        let userName = pushName || m.pushName || "User";
        const greeting = getGreeting();

        // =====================
        // Organize Commands
        // =====================
        const commandsByCategory = {};
        const activeCommands = commands.filter(cmd => cmd.pattern && !cmd.dontAdd && cmd.category);
        const totalCommands = activeCommands.length; 

        activeCommands.forEach(cmd => {
            const category = cmd.category.toUpperCase();
            const name = cmd.pattern.split("|")[0].trim();
            if (!commandsByCategory[category])
                commandsByCategory[category] = [];
            commandsByCategory[category].push(name);
        });

        const sortedCategories = Object.keys(commandsByCategory).sort();

        // =====================
        // HEADER (Cyberpunk Style)
        // =====================
        let menu = `⚡ *TIMNASA MULTIPLE BOT MENU* ⚡\n\n` +
                   ` ${greeting} *${userName}*\n` +
                   ` 🗓️ *Date:* ${date}\n` +
                   ` ⏰ *Time:* ${time}\n` +
                   ` 📊 *Total Commands:* ${totalCommands}\n\n` +
                   ` _"Breaching limitations, automating the future."_\n` +
                   `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n`;

        // =====================
        // COMMAND LIST
        // =====================
        for (const category of sortedCategories) {
            menu += `\n*╭─❖ ⚡ ${category} ⚡ ❖*\n`;
            const sortedCommands = commandsByCategory[category].sort();
            for (const cmdName of sortedCommands) {
                const prefix = config.PREFIX || '.'; 
                menu += `*│❍ ${prefix}${cmdName}*\n`;
            }
            menu += `*╰──────────────❖*\n`;
        }

        // =====================
        // FOOTER
        // =====================
        menu += `\n` +
                `┌──────────────❖\n` +
                `│ TIMNASA TIMOTH © 2026\n` +
                `└──────────────❖\n`;

        // =====================
        // CONTEXT INFO (NEWSLETTER)
        // =====================
        const newsletterContextInfo = {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: config.NEWSLETTER_JID || '120363421513037430@newsletter',
                newsletterName: config.OWNER_NAME || 'Timnasa Timoth',
                serverMessageId: 1
            }
        };

        // =====================
        // SEND MENU
        // =====================
        await conn.sendMessage(from, {
            image: { url: menuImage },
            caption: menu,
            contextInfo: {
                ...newsletterContextInfo,
                externalAdReply: {
                    title: "TIMNASA_TMD_X",
                    body: `Hello ${userName}, System Active`,
                    mediaType: 1,
                    thumbnailUrl: menuImage, // Imeongezwa kuzuia error ya kutotuma picha
                    sourceUrl: "https://github.com", // Unaweza kuweka link ya repo yako hapa
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: fakevCard });

    } catch (e) {
        console.error("Error in menu2 command:", e);
        reply("❌ Error loading menu. Angalia log za terminal yako.");
    }
});
