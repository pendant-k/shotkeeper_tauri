import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PencilSimple } from "@phosphor-icons/react";
import { Button } from "../components/Button";
import { ICON_MAP } from "../utils/icons";
import { api } from "../api";
import type { FilterPath } from "../types";

export const PopupView = () => {
    const { t, i18n } = useTranslation();
    const [paths, setPaths] = useState<FilterPath[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [fileName, setFileName] = useState("");
    const [isInputFocused, setIsInputFocused] = useState(false);

    useEffect(() => {
        const loadSettings = () => {
            api.getSettings().then((settings) => {
                if (settings.paths) setPaths(settings.paths);
                if (settings.language) i18n.changeLanguage(settings.language);
            });
        };

        loadSettings();

        let unlisten: (() => void) | undefined;
        api.onScreenshotTaken((dataUrl) => {
            setPreview(dataUrl);
            setFileName("");
            loadSettings();
        }).then((fn) => {
            unlisten = fn;
        });

        return () => {
            unlisten?.();
        };
    }, [i18n]);

    // Resize window based on content
    useEffect(() => {
        if (contentRef.current) {
            const height = contentRef.current.scrollHeight;
            api.resizePopup(340, height);
        }
    }, [paths, preview, i18n.language]);

    // Keyboard shortcuts - DISABLED when input is focused (bug fix)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip shortcuts when input is focused
            if (isInputFocused) {
                if (e.key === "Escape") {
                    (document.activeElement as HTMLElement)?.blur();
                    e.preventDefault();
                }
                return;
            }

            const key = parseInt(e.key);
            if (!isNaN(key) && key > 0 && key <= 9) {
                const index = key - 1;
                if (paths[index]) {
                    handleSelect(paths[index]);
                }
            }
            if (e.key.toLowerCase() === "c" || e.key === "ㅊ") {
                api.copyToClipboard();
            }
            if (e.key === "Escape") {
                handleCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [paths, isInputFocused]);

    const handleSelect = (path: FilterPath) => {
        api.saveScreenshot(path.path, fileName || undefined);
    };

    const handleCancel = () => {
        api.closePopup();
    };

    return (
        <div ref={contentRef} className="w-[340px] overflow-hidden">
            <div className="bg-[#191919]/95 backdrop-blur-2xl p-5 flex flex-col gap-5 animate-in fade-in zoom-in duration-200">
                {/* Header (Draggable Area Expanded) */}
                <div className="flex items-center justify-between px-1 mb-1 draggable cursor-move py-2 -mt-2">
                    <h2 className="text-[15px] font-bold text-gray-200 flex items-center gap-2 pointer-events-none">
                        {t("popup.saveTo")}
                    </h2>
                </div>

                {/* Clipboard Option */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => api.copyToClipboard()}
                        className="w-full flex items-center gap-4 p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 active:bg-blue-500/30 border border-blue-500/20 group transition-all duration-200"
                    >
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <ICON_MAP.Clipboard size={20} weight="fill" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-white font-bold text-[13px]">
                                {t("popup.copyToClipboard")}
                            </span>
                        </div>
                        <div className="ml-auto flex items-center justify-center w-6 h-6 rounded-md bg-white/10 text-[10px] font-bold text-blue-200">
                            C
                        </div>
                    </button>
                </div>

                {/* Folder Grid */}
                <div className="w-full grid grid-cols-3 gap-3">
                    {paths.map((path, index) => {
                        const IconComponent =
                            ICON_MAP[path.icon] || ICON_MAP["Folder"];
                        return (
                            <button
                                key={path.id}
                                onClick={() => handleSelect(path)}
                                className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 hover:scale-105 transition-all duration-200 aspect-square relative"
                            >
                                {/* Hotkey Badge */}
                                {index < 9 && (
                                    <div className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-black/40 text-[10px] font-bold text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        {index + 1}
                                    </div>
                                )}

                                <span className="mb-1.5 filter drop-shadow-lg group-hover:scale-110 transition-transform duration-200 text-blue-400">
                                    <IconComponent size={32} weight="fill" />
                                </span>
                                <span className="text-[11px] font-medium text-gray-300 w-full truncate text-center leading-tight">
                                    {path.name}
                                </span>
                            </button>
                        );
                    })}

                    {/* Fallback if empty */}
                    {paths.length === 0 && (
                        <div className="col-span-3 py-4 text-center text-sm text-gray-500">
                            {t("settings.noPaths")}
                        </div>
                    )}
                </div>

                {/* Filename Input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <PencilSimple
                            size={16}
                            weight="bold"
                            className="text-gray-500"
                        />
                    </div>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder={t("popup.filenamePlaceholder")}
                        className="w-full bg-[#252525] text-white text-[13px] placeholder-gray-500 rounded-xl py-3 pl-9 pr-4 border border-transparent focus:border-blue-500 focus:bg-[#2a2a2a] transition-all outline-none"
                    />
                </div>

                {/* Footer Actions */}
                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCancel}
                    className="w-full h-10"
                >
                    <div className="flex items-center justify-center w-full gap-2">
                        <span>{t("popup.cancel")}</span>
                        <div className="flex items-center justify-center h-4 px-1.5 rounded bg-black/20 text-[10px] font-bold text-white/50 border border-white/5">
                            ESC
                        </div>
                    </div>
                </Button>
            </div>
        </div>
    );
};
