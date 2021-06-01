const fetch = require("node-fetch");
const { DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN } = process.env;

exports.pushNotification = (message) => {
    fetch(`https://discord.com/api/webhooks/${DISCORD_WEBHOOK_ID}/${DISCORD_WEBHOOK_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message })
    });
};