// 1. Weka require hii juu kabisa ya faili lako kuu
const { handleLinkDetection, handleAntilinkCommand } = require('./plugins/antilink'); // Rekebisha njia kulingana na lilipo faili

// 2. Ndani ya event ya messages.upsert (Ujumbe ukiingia)
sock.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        const mek = chatUpdate.messages[0];
        if (!mek || !mek.message) return;

        // Run Link Detection kiotomatiki kwa kila ujumbe
        await handleLinkDetection(sock, mek);

        // --- SEHEMU YA KUSOMA COMMAND YA ANTILINK ---
        const chatId = mek.key.remoteJid;
        const text = mek.message?.conversation || mek.message?.extendedTextMessage?.text || '';
        const prefix = '.'; // Weka prefix ya bot yako hapa
        
        if (text.startsWith(prefix)) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === 'antilink') {
                const sender = mek.key.participant || chatId;
                const groupMetadata = chatId.endsWith('@g.us') ? await sock.groupMetadata(chatId).catch(() => ({ participants: [] })) : { participants: [] };
                const isSenderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin !== null;

                // Washa amri ya kudhibiti mfumo
                await handleAntilinkCommand(sock, chatId, mek, args, isSenderAdmin);
            }
        }
    } catch (error) {
        console.error("Main Handler Error:", error);
    }
});
