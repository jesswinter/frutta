/**
 * @module user-app-dirs
 *
 * This module provides paths for application configuration and data approipiate for the os/environment. It's intended use is for workstation environments and not servers.
 *
 * References:
 * XDG Base Directory Specification - https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
 * Windows Environment Variables - https://ss64.com/nt/syntax-variables.html
 *
 */

import path from "node:path";
import os from "node:os";

type AppDirConvention = "xdg" | "mac" | "windows";

export interface UserAppDirs {
  /** User data */
  data: string;

  /** User configuration */
  config: string;

  /** Non-essential data */
  cache: string;

  /** Which convention was used to determine paths. Intended for debugging. */
  _convention: AppDirConvention;
}

/**
 * @param appName Application name to use for sub directories
 * @param convention Convetion to use. If this is not provided `process.platform` will be used to detemine the convetion to use
 * @returns
 */
export function getAppBaseDirs(
  appName: string,
  convention?: AppDirConvention
): UserAppDirs {
  if (!convention) {
    if (process.platform === "darwin") convention = "mac";
    else if (process.platform === "win32") convention = "windows";
    else convention = "xdg";
  }

  if (convention === "mac") {
    const userLibraryDir = path.join(os.homedir(), "Library");
    return {
      data: path.join(userLibraryDir, "Application Support", appName),
      config: path.join(userLibraryDir, "Preferences", appName),
      cache: path.join(userLibraryDir, "Caches", appName),
      _convention: convention,
    };
  }

  if (convention === "windows") {
    const appDataRoamingDir =
      process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    const appDataLocalDir =
      process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
    return {
      data: path.join(appDataLocalDir, appName, "Data"),
      config: path.join(appDataRoamingDir, appName),
      cache: path.join(appDataLocalDir, appName, "Cache"),
      _convention: convention,
    };
  }

  if (convention !== "xdg") {
    throw new TypeError(`Unexpected convention: ${convention}`);
  }

  const xdgDataDir =
    process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share");
  const xdgConfigDir =
    process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  const xdgCacheDir =
    process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache");
  return {
    data: path.join(xdgDataDir, appName),
    config: path.join(xdgConfigDir, appName),
    cache: path.join(xdgCacheDir, appName),
    _convention: convention,
  };
}
