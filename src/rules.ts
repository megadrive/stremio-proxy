import type { Manifest } from "stremio-addon-sdk";
import { Config } from "./config";

export const rules = {
  // Default rules below
  change_id: (manifest: Manifest) => {
    manifest.id += "-proxied";
    return manifest;
  },
  change_name: (manifest: Manifest) => {
    manifest.name += " (proxied)";
    return manifest;
  },
  change_description: (manifest: Manifest, args: string[]) => {
    manifest.description = `Proxied addon, rules applied: ${args}\n<br>${manifest.description}`;
    return manifest;
  },
  // Custom rules below
  no_catalogs: (manifest: Manifest) => {
    manifest.catalogs = [];
    return manifest;
  },
};
export type Rule = keyof typeof rules;

export const applyRules = (manifest: Manifest, config: Config) => {
  const { rules: providedRules } = config;

  console.info(`Adding default rules`);
  const defaultRules = [
    "change_id",
    "change_name",
    `change_description:${providedRules}`,
  ];

  if (!providedRules) {
    console.info("No rules provided");
  }

  const rulesToApply = [...defaultRules, ...providedRules];

  for (const rule of rulesToApply) {
    const [ruleName, ...args] = rule.split(":");
    if (!rules.hasOwnProperty(ruleName)) {
      console.warn(`Invalid rule ${ruleName}`);
      continue;
    }

    console.info(`Applying rule ${rule}`);
    manifest = rules[ruleName](manifest, args);
  }

  return manifest;
};
