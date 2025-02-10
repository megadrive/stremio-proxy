import { z } from "zod";

const schema = z.object({
  manifestUrl: z.string(),
  rules: z.array(z.enum(["no_catalogs"])),
});
export type Config = z.infer<typeof schema>;

// base64
export const config = {
  encode: (config: Config) => {
    return Buffer.from(JSON.stringify(config)).toString("base64");
  },
  decode: (encoded: string) => {
    return schema.parse(JSON.parse(Buffer.from(encoded, "base64").toString()));
  },
};
