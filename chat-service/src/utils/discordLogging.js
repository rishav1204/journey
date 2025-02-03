import { WebhookClient } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
console.log("Discord Webhook URL:", webhookUrl?.substring(0, 20) + "...");

if (!webhookUrl) {
  throw new Error("DISCORD_WEBHOOK_URL is not configured in .env file");
}

const webhookClient = new WebhookClient({ url: webhookUrl });

const logToDiscord = async (message, level = "info") => {
  console.log("Attempting to send to Discord:", { message, level });

  try {
    const colors = {
      info: 0x3498db,
      warn: 0xf1c40f,
      error: 0xe74c3c,
      debug: 0x95a5a6,
    };

    const formattedMessage =
      typeof message === "object"
        ? JSON.stringify(message, null, 2)
        : message.toString();

    const embed = {
      color: colors[level] || colors.info,
      title: `${level.toUpperCase()} Log`,
      description: formattedMessage,
      timestamp: new Date().toISOString(),
    };

    const response = await webhookClient.send({
      embeds: [embed],
    });

    console.log("Discord log sent successfully:", response.id);
    return true;
  } catch (err) {
    console.log("Discord logging failed:", error);
    throw err;
  }
};

export default { logToDiscord };
