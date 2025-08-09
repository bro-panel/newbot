const { cmd } = require("../command");

cmd(
  {
    pattern: "alive",
    react: "🤖",
    desc: "Show bot status",
    category: "main",
    filename: __filename,
    fromMe: false,
  },
  async (malvin, mek, m, { reply }) => {
    try {
      const from = mek.key.remoteJid;

      await malvin.sendPresenceUpdate("recording", from);

      // Alive Image & Caption
      await malvin.sendMessage(
        from,
        {
          image: {
            url: "https://i.ibb.co/XrNYBKgD/tmp.jpg",
          },
          caption: `
          ╭━━〔 🤖 *𝐒𝙷𝙰𝙶𝙴𝙴 𝐌𝙳 𝐒𝚃𝙰𝚃𝚄𝚂* 〕━━⬣
┃  🟢 *𝐇𝙴𝚈 𝐁𝙰𝙱𝚈 𝐈'𝚖 𝐀𝚕𝚒𝚟𝚎!*
┃
┃ ◯✕👑 *Owner:* 𝐃ɪɴᴇᴛʜ 𝐖ɪꜱʜᴍɪᴛʜᴀ
┃ ◯✕ 🔖 *Vᴇʀꜱɪᴏɴ:* 𝐕 1.0.1
┃ ◯✕ 🛠️ *Pʀᴇꜰɪx:* [ ${config.PREFIX} ]
┃ ◯✕ ⚙️ *Mᴏᴅᴇ:* [ ${config.MODE} ]
┃ ◯✕ 💾 *Rᴀᴍ:* ${heapUsed}MB / ${totalMem}MB
┃ ◯✕ 🖥️ *Hᴏꜱᴛ:* ${os.hostname()}
┃ ◯✕ ⏱️ *Uᴘᴛɪᴍᴇ:* ${uptime}
╰━━━━━━━━━━━━━━⬣*
          
          *⚔ 𝐒𝙷𝙰𝙶𝙴𝙴 𝐌𝙳 𝐀𝙻𝙸𝚅𝙴 𝐍𝙾𝚆 🌑✋*
  
*👑 𝗼𝗳𝗳𝗶𝗰𝗶𝗮𝗹 𝘄𝗵𝗮𝘁𝘀𝗮𝗽𝗽 𝗰𝗵𝗮𝗻𝗲𝗹 -: https://whatsapp.com/channel/0029Vb6A4FQJkK7AOqqfBM17*

*⚡𝗚𝗶𝘁 𝗛𝘂𝗯 𝗥𝗲𝗽𝗼 -: https://github.com/shagee12/*

*🌻𝗢𝘄𝗻𝗲𝗿 -: https://wa.me/94703403671?text=%F0%9D%90%87%E1%B4%87%CA%9F%CA%9F%E1%B4%8F%E1%B4%A1%20%E1%B4%84%E1%B4%9C%E1%B4%85%E1%B4%9C..%F0%9F%A5%BA%E2%9C%8B*
          
* *We are not responsible for any*  
* *WhatsApp bans that may occur due to*  
* *the usage of this bot. Use it wisely*  
* *and at your own risk* ⚠️

> *𝐓ʜᴇ 𝐏ʀɪᴍɪᴜᴍ 𝐖ʜᴀᴛꜱᴀᴘᴘ 𝐁ᴏᴛ 𝐁ʏ 𝐒ʜᴀɢᴇᴇ*`,
        },
        { quoted: mek }
      );

      // Delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Voice Message
      await malvin.sendMessage(
        from,
        {
          audio: {
            url: "https://files.catbox.moe/wz8rh7.mp3",
          },
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("❌ Error in .alive command:", e);
      reply("❌ Error while sending alive message!");
    }
          })
