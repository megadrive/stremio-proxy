import express from "express";
import cors from "cors";
import { env } from "./env";
import { config } from "./config";
import { applyRules } from "./rules";
import { ManifestSchema } from "./manifest";

const app = express();
app.use(cors());

app.use(express.static("static"));

app.all("/", (req, res) => {
  res.redirect("/configure");
});

app.all("/:config?/configure", (req, res) => {
  res.redirect(
    `/${req.params.config ? `${req.params.config}/` : ""}configure.html`
  );
});

app.get("/:config/manifest.json", async (req, res) => {
  try {
    const providedConfig = config.decode(req.params.config);
    console.info({ providedConfig });

    // grab the manifest from the config
    const { manifestUrl } = providedConfig;
    if (manifestUrl === "") {
      throw new Error("Manifest URL is empty, likely a config parse error.");
    }

    const fetchedManifest = await fetch(manifestUrl);
    if (!fetchedManifest.ok) {
      res.status(500).send("Failed to fetch manifest");
      return;
    }
    const fetchedManifestJson = await fetchedManifest.json();
    const validatedManifest = ManifestSchema.parse(fetchedManifestJson);

    // depending on the rules in the config, we may need to modify the manifest
    const manipulatedManifest = applyRules(validatedManifest, providedConfig);

    res.send(manipulatedManifest);
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
  res.redirect(redirectUrl.toString());
  return;
});

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});
