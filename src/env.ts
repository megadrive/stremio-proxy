import { cleanEnv, num } from "envalid";
import { config } from "dotenv";
config();

export const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
});
