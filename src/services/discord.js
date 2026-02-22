import { DiscordSDK } from "@discord/embedded-app-sdk";

// We use the environment variable for Client ID.
// If not provided, we use a placeholder so the app continues to compile.
const clientId = process.env.VUE_APP_DISCORD_CLIENT_ID || "123456789012345678";

// A simple heuristic to determine if we are running in an iframe (e.g., Discord)
export const isDiscordActivity = window.parent !== window;

export let discordSdk = null;
export let isDiscordStoryteller = false;

if (isDiscordActivity) {
  discordSdk = new DiscordSDK(clientId);
}

export async function checkIsStoryteller() {
  if (!discordSdk || !discordSdk.channelId) return false;
  try {
    const { permissions } = await discordSdk.commands.getChannelPermissions();
    if (!permissions) return false;

    // MUTE_MEMBERS (1 << 22), DEAFEN_MEMBERS (1 << 23), MANAGE_CHANNELS (1 << 4)
    const perms = BigInt(permissions);
    const MUTE_MEMBERS = 1n << 22n;
    const DEAFEN_MEMBERS = 1n << 23n;
    const MANAGE_CHANNELS = 1n << 4n;

    return (
      (perms & MUTE_MEMBERS) === MUTE_MEMBERS ||
      (perms & DEAFEN_MEMBERS) === DEAFEN_MEMBERS ||
      (perms & MANAGE_CHANNELS) === MANAGE_CHANNELS
    );
  } catch (e) {
    console.warn(
      "Failed to check Discord channel permissions. Defaulting to player.",
      e,
    );
    return false;
  }
}

export async function initDiscordSdk() {
  if (!discordSdk) return false;
  try {
    await discordSdk.ready();
    console.log("Discord SDK is ready!");

    isDiscordStoryteller = await checkIsStoryteller();

    return true;
  } catch (e) {
    console.error("Failed to initialize Discord SDK:", e);
    return false;
  }
}
