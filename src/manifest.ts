import { types } from "util";
import z from "zod";

const ManifestTypesSchema = z.array(z.enum(["movie", "series", "tv"]));

const FullManifestResourceSchema = z.object({
  name: z.string(),
  types: ManifestTypesSchema,
  idPrefixes: z.array(z.string()),
});

const ManifestCatalogSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ManifestTypesSchema,
  gentres: z.array(z.string()).optional(),
  extra: z
    .array(
      z.object({
        name: z.enum(["search", "genre", "skip"]),
        isRequired: z.boolean().optional(),
        options: z.array(z.string()).optional(),
        optionsLimit: z.number().optional(),
      })
    )
    .optional(),
});

export const ManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  resources: z.array(FullManifestResourceSchema),
  types: z.array(ManifestTypesSchema),
  catalogs: z.array(ManifestCatalogSchema),
  addonCatalogs: z.array(ManifestCatalogSchema).optional(),
  idPrefixes: z.array(z.string()).optional(),
  background: z.string().optional(),
  icon: z.string().optional(),
  logo: z.string().optional(),
  contactEmail: z.string().optional(),
  behaviorHints: z
    .array(
      z.object({
        adult: z.boolean().optional(),
        p2p: z.boolean().optional(),
        configurable: z.boolean().optional(),
        configurationRequired: z.boolean().optional(),
      })
    )
    .optional(),
});
export type Manifest = z.infer<typeof ManifestSchema>;

export const manifest: Manifest = {
  id: "com.github.megadrive.stremio-proxy",
  name: "Stremio Proxy",
  description: "Proxy for Stremio",
  version: "1.0.0",
  resources: [],
  types: [],
  catalogs: [],
};
