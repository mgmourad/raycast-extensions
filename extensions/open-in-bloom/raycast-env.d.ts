/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Bloom Application Name - The name of the Bloom app as it appears in your Applications folder */
  "bloomAppName": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-and-open-in-bloom` command */
  export type SearchAndOpenInBloom = ExtensionPreferences & {}
  /** Preferences accessible in the `open-finder-selection-in-bloom` command */
  export type OpenFinderSelectionInBloom = ExtensionPreferences & {}
  /** Preferences accessible in the `open-clipboard-path-in-bloom` command */
  export type OpenClipboardPathInBloom = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-and-open-in-bloom` command */
  export type SearchAndOpenInBloom = {}
  /** Arguments passed to the `open-finder-selection-in-bloom` command */
  export type OpenFinderSelectionInBloom = {}
  /** Arguments passed to the `open-clipboard-path-in-bloom` command */
  export type OpenClipboardPathInBloom = {}
}

