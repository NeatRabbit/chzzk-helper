import type { ForgeConfig } from "@electron-forge/shared-types";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import fsp from "node:fs/promises";
import path from "node:path";

/**
 * @param {string} folder
 * @param {string} [exclude]
 */
async function cleanupEmptyFolders(folder: string, exclude?: string[]) {
  if (!(await fsp.stat(folder)).isDirectory()) return;

  const folderName = path.basename(folder);
  if (exclude && exclude.includes(folderName)) {
    return;
  }

  let files = await fsp.readdir(folder);

  if (files.length > 0) {
    await Promise.all(
      files.map((file) => cleanupEmptyFolders(path.join(folder, file), exclude))
    );
    files = await fsp.readdir(folder);
  }

  if (files.length === 0) {
    await fsp.rmdir(folder);
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: "public/icon",
    prune: true,
    afterPrune: [
      (buildPath, _, __, ___, callback) => {
        cleanupEmptyFolders(path.join(buildPath, "node_modules"))
          .then(() => callback())
          .catch((error) => callback(error));
      },
    ],
    ignore: [
      ".commitlintrc.js",
      ".editorconfig",
      ".env.development",
      ".env.example",
      ".env.production",
      ".eslintrc.js",
      ".git",
      ".gitignore",
      ".husky",
      ".idea",
      ".yarn",
      ".yarnrc.yml",
      "yarn.lock",
      "assets",
      "forge.config.js",
      "jsconfig.json",
      "package-lock.json",
      "pnpm-lock.yaml",
      "src",
      "vite.preload-notify.config.mjs",
      "vite.preload.config.mjs",
      "vite.renderer-notify.config.mjs",
      "vite.renderer.config.mjs",
      "node_modules/fastify/test",
    ].map((x) => new RegExp("^/" + x)),
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32"],
      config: {},
    },
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "me",
          name: "NeatRabbit",
        },
        prerelease: true,
      },
    },
  ],
};

export default config;
