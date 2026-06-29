import { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { logger } from "../Logger";

// Helper: safely defer any interaction
export class DiscordUtils {
  static async safeDefer(interaction: ButtonInteraction | ModalSubmitInteraction) {
    try {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferUpdate();
      }
    } catch (e) {
      logger.warn("Failed to defer interaction:", e);
    }
  }
}