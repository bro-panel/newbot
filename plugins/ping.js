const { cmd } = require("../command");

cmd(
  {
    pattern: "ping",
    desc: "Check bot latency",
    react: "🖥️",
    category: "utility",
    filename: __filename,
  },
  async (malvin, mek, m, { reply }) => {
    const start = Date.now();
    await malvin.sendMessage(mek.key.remoteJid, { text: "𝐂ᴜᴛᴇ 𝐒ʜᴀɢᴇᴇ 𝐏ɪɴɢɪɴɢ...👻" }, { quoted: mek });

    const ping = Date.now() - start;
    reply(`*🏓 𝐏ᴏɴɢ!*: ${ping}𝐌ꜱ`);
  }
);
