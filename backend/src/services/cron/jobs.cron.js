import cron from "node-cron";
import { syncWeLoveDevs } from "../API_welovedevs/welovedev.sync.js";
import { syncRemotive } from "../API_remotive/remotive.sync.js";

cron.schedule("* * * * *", async () => {
      console.log("Sync global (toutes les 1 min pour test)...");

      try {
            await Promise.all([
                  syncWeLoveDevs(),
                  syncRemotive(),
            ]);

            console.log("Tous les jobs sync");
      } catch (error) {
            console.error("Erreur globale:", error.message);
      }
});