const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    // Kuchukua ID ya aliyetuma amri (sender)
    const sender = message.key.participant || message.key.remoteJid;
    
    // Kuchukua Jina la aliyetuma amri
    const pushName = message.pushName || "Cyber_User";

    // Muonekano wa Kisasa wa Mwaka 2036 (Quantum Cyberpunk Menu)
    const rawMenuText = `⚡ ─── 『 *${settings.botName || 'TIMNASA_TMD-X'}* 』 ─── ⚡
🌐 *[QUANTUM CORE V4.0.0 - YEAR 2036]*
👤 *Operator:* ${pushName}
👑 *Developer:* ${settings.botOwner || 'Timnasa Timoth'}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

_“Automating realities, expanding digital horizons.”_

╔════════════════════╗
      🌐 GENERAL COMMANDS
╚════════════════════╝
➤ ┃ help or .menu
➤ ┃ ping
➤ ┃ alive
➤ ┃ tts <text>
➤ ┃ owner
➤ ┃ joke
➤ ┃ quote
➤ ┃ fact
➤ ┃ weather <city>
➤ ┃ news
➤ ┃ attp <text>
➤ ┃ lyrics <song_title>
➤ ┃ 8ball <question>
➤ ┃ groupinfo
➤ ┃ staff or .admins 
➤ ┃ vv
➤ ┃ trt <text> <lang>
➤ ┃ ss <link>
➤ ┃ jid
➤ ┃ url

╔════════════════════╗
      👮‍♂️ ADMIN COMMANDS
╚════════════════════╝
➤ ┃ ban @user
➤ ┃ promote @user
➤ ┃ demote @user
➤ ┃ mute <minutes>
➤ ┃ unmute
➤ ┃ delete or .del
➤ ┃ kick @user
➤ ┃ warnings @user
➤ ┃ warn @user
➤ ┃ antilink
➤ ┃ antibadword
➤ ┃ clear
➤ ┃ tag <message>
➤ ┃ tagall
➤ ┃ tagnotadmin
➤ ┃ hidetag <message>
➤ ┃ chatbot
➤ ┃ resetlink
➤ ┃ antitag <on/off>
➤ ┃ welcome <on/off>
➤ ┃ goodbye <on/off>
➤ ┃ setgdesc <description>
➤ ┃ setgname <new name>
➤ ┃ setgpp (reply to image)

╔════════════════════╗
      🔒 OWNER COMMANDS
╚════════════════════╝
➤ ┃ mode <public/private>
➤ ┃ clearsession
➤ ┃ antidelete
➤ ┃ cleartmp
➤ ┃ update
➤ ┃ settings
➤ ┃ setpp <reply to image>
➤ ┃ autoreact <on/off>
➤ ┃ autostatus <on/off>
➤ ┃ autostatus react <on/off>
➤ ┃ autotyping <on/off>
➤ ┃ autoread <on/off>
➤ ┃ anticall <on/off>
➤ ┃ pmblocker <on/off/status>
➤ ┃ pmblocker setmsg <text>
➤ ┃ setmention <reply to msg>
➤ ┃ mention <on/off>

╔════════════════════╗
   🎨 IMAGE/STICKER COMMANDS
╚════════════════════╝
➤ ┃ blur <image>
➤ ┃ simage <reply to sticker>
➤ ┃ sticker <reply to image>
➤ ┃ removebg
> ➤ ┃ remini
➤ ┃ crop <reply to image>
➤ ┃ tgsticker <Link>
➤ ┃ meme
➤ ┃ take <packname> 
➤ ┃ emojimix <emj1>+<emj2>
➤ ┃ igs <insta link>
➤ ┃ igsc <insta link>

╔════════════════════╗
      🖼️ PIES COMMANDS
╚════════════════════╝
➤ ┃ pies <country>
➤ ┃ china 
➤ ┃ indonesia 
➤ ┃ japan 
➤ ┃ korea 
➤ ┃ hijab

╔════════════════════╗
      🎮 GAME COMMANDS
╚════════════════════╝
➤ ┃ tictactoe @user
➤ ┃ hangman
➤ ┃ guess <letter>
➤ ┃ trivia
➤ ┃ answer <answer>
➤ ┃ truth
➤ ┃ dare

╔════════════════════╗
       🤖 AI COMMANDS
╚════════════════════╝
➤ ┃ gpt <question>
➤ ┃ gemini <question>
➤ ┃ imagine <prompt>
➤ ┃ flux <prompt>
➤ ┃ sora <prompt>

╔════════════════════╗
       🎯 FUN COMMANDS
╚════════════════════╝
➤ ┃ compliment @user
➤ ┃ insult @user
➤ ┃ flirt 
➤ ┃ shayari
➤ ┃ goodnight
➤ ┃ roseday
➤ ┃ character @user
➤ ┃ wasted @user
➤ ┃ ship @user
➤ ┃ simp @user
➤ ┃ stupid @user [text]

╔════════════════════╗
      🔤 TEXTMAKER
╚════════════════════╝
➤ ┃ metallic <text>
➤ ┃ ice <text>
➤ ┃ snow <text>
➤ ┃ impressive <text>
➤ ┃ matrix <text>
➤ ┃ light <text>
➤ ┃ neon <text>
➤ ┃ devil <text>
➤ ┃ purple <text>
➤ ┃ thunder <text>
➤ ┃ leaves <text>
➤ ┃ 1917 <text>
➤ ┃ arena <text>
➤ ┃ hacker <text>
➤ ┃ sand <text>
➤ ┃ blackpink <text>
➤ ┃ glitch <text>
➤ ┃ fire <text>

╔════════════════════╗
      📥 DOWNLOADER
╚════════════════════╝
➤ ┃ play <song_name>
➤ ┃ song <song_name>
➤ ┃ spotify <query>
➤ ┃ instagram <link>
➤ ┃ facebook <link>
➤ ┃ tiktok <link>
➤ ┃ video <song name>
➤ ┃ ytmp4 <Link>

╔════════════════════╗
        🧩 MISC
╚════════════════════╝
➤ ┃ heart
➤ ┃ horny
➤ ┃ circle
➤ ┃ lgbt
➤ ┃ lolice
➤ ┃ its-so-stupid
➤ ┃ namecard 
➤ ┃ oogway
➤ ┃ tweet
➤ ┃ ytcomment 
➤ ┃ comrade 
➤ ┃ gay 
➤ ┃ glass 
➤ ┃ jail 
➤ ┃ passed 
➤ ┃ triggered

╔════════════════════╗
       🖼️ ANIME
╚════════════════════╝
➤ ┃ nom 
➤ ┃ poke 
➤ ┃ cry 
➤ ┃ kiss 
➤ ┃ pat 
➤ ┃ hug 
➤ ┃ wink 
➤ ┃ facepalm 

╔════════════════════╗
     💻 GITHUB COMMANDS
╚════════════════════╝
➤ ┃ git
➤ ┃ github
➤ ┃ sc
➤ ┃ script
➤ ┃ repo

⚡ Join our channel for updates ⚡`;

    // Hesabu idadi ya commands zote kulingana na alama ya "➤" au "> ➤"
    const commandCount = (rawMenuText.match(/➤/g) || []).length;

    // Kuingiza idadi ya commands juu ya menu kwa usahihi
    const helpMessage = rawMenuText.replace(
        "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
        `📊 *Total Commands:* ${commandCount}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`
    );

    try {
        let finalImageBuffer;
        
        try {
            // Jaribu kuchukua Picha ya Wasifu ya alietuma command
            const pfpUrl = await sock.profilePictureUrl(sender, 'image');
            const axios = require('axios');
            const response = await axios.get(pfpUrl, { responseType: 'arraybuffer' });
            finalImageBuffer = Buffer.from(response.data, 'binary');
        } catch (e) {
            // Kama hana picha au imefeli, tumia picha iliyopo kwenye assets kama fallback
            const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
            if (fs.existsSync(imagePath)) {
                finalImageBuffer = fs.readFileSync(imagePath);
            }
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

        if (finalImageBuffer) {
            await sock.sendMessage(chatId, {
                image: finalImageBuffer,
                caption: helpMessage,
                contextInfo: newsletterConfig
            }, { quoted: message });
        } else {
            // Kama hakuna kabisa picha, tuma kama maandishi ya kawaida lakini yenye muonekano wa newsletter
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: newsletterConfig
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in futuristic help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage }, { quoted: message });
    }
}

module.exports = helpCommand;
