import express from "express";
import cors from "cors";
import { cleanEnv, num } from "envalid";
import { manifest } from "./manifest";
import { config } from "./config";
import { applyRules } from "./rules";

const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
});

const app = express();
app.use(cors());

app.use(express.static("static"));

app.get("/:config/manifest.json", async (req, res) => {
  const providedConfig = config.decode(req.params.config);
  console.info({ providedConfig });

  try {
    // grab the manifest from the config
    const { manifestUrl } = providedConfig;

    const fetchedManifest = await fetch(manifestUrl);
    if (!fetchedManifest.ok) {
      res.status(500).send("Failed to fetch manifest");
      return;
    }
    const fetchedManifestJson = await fetchedManifest.json();

    // depending on the rules in the config, we may need to modify the manifest
    const manipulatedManifest = applyRules(fetchedManifestJson, providedConfig);
    manipulatedManifest.id += "-proxied";

    res.send(manipulatedManifest);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).send("Invalid config");
  }

  return;
});

app.all("/:config/*", (req, res) => {
  const providedConfig = config.decode(req.params.config);
  console.info({ providedConfig });

  console.info(req.path);

  const redirectPath = req.path.split(/\/+/).filter(Boolean).slice(1).join("/");
  const redirectBase = new URL(providedConfig.manifestUrl).origin;
  const redirectUrl = new URL(redirectPath, redirectBase);

  console.info(`Redirecting to ${redirectUrl.toString()}`);

  // redirect to the endpoint without the config
  // res.redirect(redirectUrl.toString());
  res.redirect(redirectUrl.toString());
  return;
});

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});
