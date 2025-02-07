import express from "express";
import cors from "cors";
import { cleanEnv, num } from "envalid";
import { manifest } from "./manifest";
import { config } from "./config";

const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
});

const app = express();
app.use(cors());

app.get("/:config/manifest.json", async (req, res) => {
  const proxiedManifest = Object.assign({}, manifest);
  const providedConfig = config.decode(req.params.config);

  try {
    // grab the manifest from the config
    const { manifestUrl } = providedConfig;

    const fetchedManifest = await fetch(manifestUrl);
    if (!fetchedManifest.ok) {
      res.status(500).send("Failed to fetch manifest");
      return;
    }

    // depending on the rules in the config, we may need to modify the manifest
    const { rules } = providedConfig;
    for (const rule of rules) {
      switch (rule) {
        case "no_catalogs":
          proxiedManifest.catalogs = [];
          break;
      }
    }

    res.send(proxiedManifest);
    return;
  } catch (error) {
    res.status(500).send("Invalid config");
  }

  return;
});

app.all("/:config/*", (req, res) => {
  // TODO: implement proxying
  res.send("Not implemented");
});

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});
