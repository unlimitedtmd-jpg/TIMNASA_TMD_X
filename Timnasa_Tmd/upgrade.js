const { exec } = require('child_process');
const settings = require('../settings.js');

async function upgradeCommand(sock, chatId, message) {
    try {
        // 1. Send initial notification
        await sock.sendMessage(chatId, { text: '🔄 *TIMNASA-TMD-X is checking for updates... Please wait.*' }, { quoted: message });

        const repoUrl = 'https://github.com/unlimitedtmd-jpg/TIMNASA_TMD_X';

        // 2. Execute Git fetch to check for new changes
        exec(`git fetch origin && git log HEAD..origin/main --oneline`, async (err, stdout, stderr) => {
            if (err) {
                console.error('Git fetch error:', err);
                return sock.sendMessage(chatId, { text: '❌ *Failed to connect to GitHub. Ensure Git is installed on the host.*' }, { quoted: message });
            }

            // If no updates are found
            if (!stdout.trim()) {
                return sock.sendMessage(chatId, { text: '✅ *Your TIMNASA_TMD_X is already up to date with the latest version!*' }, { quoted: message });
            }

            // If updates are available, start pulling the code
            await sock.sendMessage(chatId, { text: '📥 *New updates detected! Downloading and applying changes now...*' }, { quoted: message });

            exec(`git stash && git pull ${repoUrl} main && npm install`, async (pullErr, pullStdout, pullStderr) => {
                if (pullErr) {
                    console.error('Git pull error:', pullErr);
                    return sock.sendMessage(chatId, { text: '❌ *Update process failed due to a code conflict (Merge Conflict).*' }, { quoted: message });
                }

                // 3. Send success message before restarting
                await sock.sendMessage(chatId, { text: '✅ *TIMNASA_TMD_X updated successfully! The system is now restarting to apply updates...*' }, { quoted: message });

                // 4. Force restart (Works perfectly with PM2, Heroku, Render, or Pterodactyl auto-restart configurations)
                setTimeout(() => {
                    process.exit(0); 
                }, 3000);
            });
        });

    } catch (error) {
        console.error('Error in upgrade command:', error);
        await sock.sendMessage(chatId, { text: '❌ *An error occurred while attempting to upgrade the system.*' }, { quoted: message });
    }
}

module.exports = upgradeCommand;
