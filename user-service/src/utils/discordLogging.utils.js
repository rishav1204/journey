import { WebhookClient } from 'discord.js';

const webhookUrl = process.env.DISCORD_WEBHOOK_URL; // Add this to your .env file
const webhookClient = new WebhookClient({ url: webhookUrl })

const logToDiscord = async (message, level = 'info') => {
  try {
    const colors = {
      info: 0x3498db,    // Blue
      warn: 0xf1c40f,    // Yellow
      error: 0xe74c3c,   // Red
      debug: 0x95a5a6    // Gray
    }

    const embed = {
      color: colors[level] || colors.info,
      title: `${level.toUpperCase()} Log`,
      description: typeof message === 'object' ? JSON.stringify(message, null, 2) : message,
      timestamp: new Date().toISOString()
    }

    await webhookClient.send({
      embeds: [embed]
    })
  } catch (error) {
    console.error('Discord logging failed:', error)
  }
}

export default {
  logToDiscord
}
