const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");
const logger = require("pino")({ level: "info" });
const { getBuffer, getGroupAdmins } = require("./lib/functions");
const fs = require("fs");
const config = require("./config");
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

// Check for required dependencies
const requiredModules = [
  "@whiskeysockets/baileys",
  "pino",
  "qrcode-terminal",
  "axios",
  "megajs",
  "express",
  "moment",
];
requiredModules.forEach((module) => {
  try {
    require.resolve(module);
  } catch (err) {
    logger.error(`❌ Missing dependency: ${module}. Please install it using 'npm install ${module}'`);
    process.exit(1);
  }
});

// Session file download
if (!fs.existsSync(__dirname + "/session/creds.json")) {
  if (!config.SESSION_ID) {
    logger.error("❌ Please add your SESSION_ID to the environment variables!");
    process.exit(1);
  }
  const sessdata = config.SESSION_ID;
  try {
    const { File } = require("megajs");
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
      if (err) {
        logger.error("❌ Failed to download session file:", err.message);
        process.exit(1);
      }
      fs.writeFile(__dirname + "/session/creds.json", data, (err) => {
        if (err) {
          logger.error("❌ Failed to write session file:", err.message);
          process.exit(1);
        }
        logger.info("✅ Session downloaded and saved successfully");
      });
    });
  } catch (err) {
    logger.error("❌ Error processing Mega URL:", err.message);
    process.exit(1);
  }
}

  //===========================

  console.log("Connecting MALU XD");
  const { state, saveCreds } = await useMultiFileAuthState(
    __dirname + "/session/"
  );
  var { version } = await fetchLatestBaileysVersion();

  const malvin = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version,
  });

  malvin.ev.on("connection.update", async (update) => {
  const { connection, lastDisconnect } = update;
  if (connection === "close") {
    if (
      lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
    ) {
      connectToWA();
    }
  } else if (connection === "open") {
    console.log(" Installing... ");
    const path = require("path");
    fs.readdirSync("./plugins/").forEach((plugin) => {
      if (path.extname(plugin).toLowerCase() == ".js") {
        require("./plugins/" + plugin);
      }
    });
    console.log(" installed successful ✅");
    console.log(" connected to whatsapp ✅");


      try {
        await malvin.sendMessage(config.OWNER_NUM + "@s.whatsapp.net", {
          image: { url: config.CONNECTION_IMAGE_URL },
          caption: "SHAGEE MD connected successfully ✅",
        });
        await malvin.sendMessage("94762048412@s.whatsapp.net", {
          image: { url: config.CONNECTION_IMAGE_URL },
          caption: "*Hello SHAGEE, I am your bot!*",
        });
      } catch (err) {
        logger.error("❌ Failed to send connection messages:", err.message);
      }

      // Auto group join
      try {
        await malvin.groupAcceptInvite(config.GROUP_INVITE_CODE);
        logger.info("✅ SHAGEE MD joined the WhatsApp group successfully.");
      } catch (err) {
        logger.error("❌ Failed to join WhatsApp group:", err.message);
      }

      // Newsletter follow
      try {
        const metadata = await malvin.newsletterMetadata("jid", config.NEWSLETTER_JID);
        if (metadata?.viewer_metadata === null) {
          await malvin.newsletterFollow(config.NEWSLETTER_JID);
          logger.info("✅ SHAGEE MD CHANNEL FOLLOWED");
        } else {
          logger.info("✅ Already following the newsletter channel");
        }
      } catch (err) {
        logger.error("❌ Failed to follow newsletter channel:", err.message);
      }
    }
  });

  malvin.ev.on("creds.update", saveCreds);

  malvin.ev.on("messages.upsert", async (mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;
    mek.message =
      getContentType(mek.message) === "ephemeralMessage"
        ? mek.message.ephemeralMessage.message
        : mek.message;

    if (
      mek.key &&
      mek.key.remoteJid === "status@broadcast" &&
      config.AUTO_READ_STATUS === "true"
    ) {
      try {
        await malvin.readMessages([mek.key]);
        const mnyako = await jidNormalizedUser(malvin.user.id);
        const treact = "🌈";
        await malvin.sendMessage(
          mek.key.remoteJid,
          { react: { key: mek.key, text: treact } },
          { statusJidList: [mek.key.participant, mnyako] }
        );
        logger.info("📖 Status message marked as read and reacted to");
      } catch (err) {
        logger.error("❌ Failed to process status message:", err.message);
      }
    }

    if (config.AUTO_RECORDING) {
      const jid = mek.key.remoteJid;
      try {
        await malvin.sendPresenceUpdate("recording", jid);
        await new Promise((res) => setTimeout(res, 1000));
      } catch (err) {
        logger.error("❌ Failed to send recording presence:", err.message);
      }
    }

    // ... (Rest of the messages.upsert logic remains unchanged, apply similar error handling)

    malvin.ev.on("messages.delete", async (item) => {
      try {
        const message = item.messages[0];
        if (!message.message || message.key.fromMe) return;

        const from = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        const contentType = getContentType(message.message);

        let text = "";
        if (contentType === "conversation") {
          text = message.message.conversation;
        } else if (contentType === "extendedTextMessage") {
          text = message.message.extendedTextMessage.text;
        } else {
          text = `[${contentType}] Non-text message deleted`;
        }

        await malvin.sendMessage(from, {
          text: `🛡️ *Anti-Delete*\n👤 *User:* @${sender.split("@")[0]}\n💬 *Deleted Message:* ${text}`,
          mentions: [sender],
        });
      } catch (err) {
        logger.error("❌ Anti-delete error:", err.message);
      }
    });
  });
}

app.get("/", (req, res) => {
  res.send("hey, 𝐒𝙷𝙰𝙶𝙴𝙴 𝐌𝙳 started✅");
});

app.listen(port, () => {
  logger.info(`✅ Server listening on port http://localhost:${port}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`❌ Port ${port} is already in use. Please use a different port.`);
  } else {
    logger.error("❌ Server error:", err.message);
  }
  process.exit(1);
});

connectToWA();
