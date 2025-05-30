import { HttpsOptions } from "firebase-functions/v2/https";
import { ScheduleOptions } from "firebase-functions/v2/scheduler";

export const httpsOptions: HttpsOptions & Omit<ScheduleOptions, "schedule"> = {
  region: "europe-west3",
  cors: [/127.0.0.1:*([0-9]+)?$/, /localhost:*([0-9]+)?$/],
};
