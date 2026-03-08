import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { FilterPath } from "./types";

export interface Settings {
    paths: FilterPath[];
    language: string;
}

export const api = {
    getSettings: (): Promise<Settings> => invoke("get_settings"),

    saveSettings: (settings: {
        paths: FilterPath[];
        language: string;
    }): Promise<void> =>
        invoke("save_settings", {
            paths: settings.paths,
            language: settings.language,
        }),

    selectFolder: (): Promise<string | null> => invoke("select_folder"),

    saveScreenshot: (
        targetFolderPath: string,
        fileName?: string
    ): Promise<void> =>
        invoke("save_screenshot", {
            targetFolderPath,
            fileName: fileName || null,
        }),

    closePopup: (): Promise<void> => invoke("close_popup"),

    resizePopup: (width: number, height: number): Promise<void> =>
        invoke("resize_popup", { width, height }),

    checkPermission: (): Promise<{ granted: boolean }> =>
        invoke("check_permission"),

    openPermissionSettings: (): Promise<void> =>
        invoke("open_permission_settings"),

    copyToClipboard: (): Promise<void> => invoke("copy_to_clipboard"),

    deleteScreenshot: (): Promise<void> => invoke("delete_screenshot"),

    onScreenshotTaken: (
        callback: (dataUrl: string) => void
    ): Promise<UnlistenFn> =>
        listen<string>("screenshot-taken", (event) =>
            callback(event.payload)
        ),
};
