const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("WhatsApp Bot is running...");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

// Baileys WhatsApp bot
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const P = require("pino");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      console.log("Connection closed. Restarting...");
      startBot();
    }

    if (connection === "open") {
      console.log("WhatsApp Connected!");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    if (text === "!ping") {
      await sock.sendMessage(msg.key.remoteJid, { text: "Pong ✅" });
    }

    if (text === "!hello") {
      await sock.sendMessage(msg.key.remoteJid, { text: "Hello 👋 I am your bot!" });
    }
  });
}

startBot();
