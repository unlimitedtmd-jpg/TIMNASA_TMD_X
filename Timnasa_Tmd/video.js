const axios = require('axios');
const yts = require('yt-search');

// Izumi API configuration
const izumi = {
    baseURL: "https://izumiiiiiiii.dpdns.org"
};

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
};

async function tryRequest(getter, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await getter();
        } catch (err) {
            lastError = err;
            if (attempt < attempts) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    throw lastError;
}

async function getIzumiVideoByUrl(youtubeUrl) {
    const apiUrl = `${izumi.baseURL}/downloader/youtube?url=${encodeURIComponent(youtubeUrl)}&format=720`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.result?.download) return res.data.result; 
    throw new Error('Izumi video api returned no download');
}

async function getOkatsuVideoByUrl(youtubeUrl) {
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.result?.mp4) {
        return { download: res.data.result.mp4, title: res.data.result.title };
    }
    throw new Error('Okatsu ytmp4 returned no mp4');
}

async function videoCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        if (!searchQuery) {
            await sock.sendMessage(chatId, { 
                text: '⚡ *TIMNASA_TMD_X* ⚡\n\n❌ _Error: Tafadhali weka jina au link ya video unayotaka kupakua._\n\n*Example:* `.video Hustler Diaries`' 
            }, { quoted: message });
            return;
        }

        // Determine if input is a YouTube link
        let videoUrl = '';
        let videoTitle = '';
        let videoThumbnail = '';
        let videoDuration = 'Unknown';
        let videoViews = 'Unknown';

        if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
            videoUrl = searchQuery;
        } else {
            // Search YouTube for the video
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                await sock.sendMessage(chatId, { text: '❌ *TIMNASA_TMD_X:* No videos found!' }, { quoted: message });
                return;
            }
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
            videoDuration = videos[0].timestamp || 'Unknown';
            videoViews = videos[0].views ? videos[0].views.toLocaleString() : 'Unknown';
        }

        // Send thumbnail immediately with Modern Cyberpunk layout
        try {
            const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
            const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
            const captionTitle = videoTitle || searchQuery;
            
            let loadMsg = `⚡ *TIMNASA TMD-X VIDEO SYSTEM* ⚡\n\n` +
                          `🎬 *Title:* ${captionTitle}\n` +
                          `⏱️ *Duration:* ${videoDuration}\n` +
                          `👁️ *Views:* ${videoViews}\n\n` +
                          `🛸 _Breaching YouTube servers... Fetching video payload._\n` +
                          `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
                          `⏳ _Downloading, please wait..._`;

            if (thumb) {
                await sock.sendMessage(chatId, {
                    image: { url: thumb },
                    caption: loadMsg
                }, { quoted: message });
            }
        } catch (e) { console.error('[VIDEO] thumb error:', e?.message || e); }
        

        // Validate YouTube URL
        let urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
        if (!urls) {
            await sock.sendMessage(chatId, { text: '❌ *TIMNASA_TMD_X:* Invalid YouTube link structure!' }, { quoted: message });
            return;
        }

        // Get video: try Izumi first, then Okatsu fallback
        let videoData;
        try {
            videoData = await getIzumiVideoByUrl(videoUrl);
        } catch (e1) {
            videoData = await getOkatsuVideoByUrl(videoUrl);
        }

        // Modern UI Footer for Final Video
        let finalCaption = `⚡ *TIMNASA MULTIPLE BOT SYSTEM* ⚡\n\n` +
                           `📦 *Payload:* ${videoData.title || videoTitle || 'Video'}.mp4\n` +
                           `🔥 *Status:* Successfully Decrypted & Injected\n\n` +
                           `┌──────────────❖\n` +
                           `│ TIMNASA TIMOTH © 2026\n` +
                           `└──────────────❖`;

        // Send video directly using the download URL
        await sock.sendMessage(chatId, {
            video: { url: videoData.download },
            mimetype: 'video/mp4',
            fileName: `${videoData.title || videoTitle || 'video'}.mp4`,
            caption: finalCaption
        }, { quoted: message });

    } catch (error) {
        console.error('[VIDEO] Command Error:', error?.message || error);
        await sock.sendMessage(chatId, { 
            text: `❌ *TIMNASA_TMD_X ERROR*\n\n⚠️ _Download crashed: ${error?.message || 'Unknown network error'}_` 
        }, { quoted: message });
    }
}

module.exports = videoCommand;
