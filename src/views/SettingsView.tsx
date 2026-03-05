import { useState, useEffect } from "react";
import { FolderPlus, AlertTriangle, ExternalLink, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilterPath } from "../types";
import { SettingsHeader } from "../components/SettingsHeader";
import { ConfirmModal } from "../components/ConfirmModal";
import { BottomMenu } from "../components/BottomMenu";
import { useAppLanguage } from "../hooks/useAppLanguage";
import { api } from "../api";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortablePathItem } from "../components/SortablePathItem";

export const SettingsView = () => {
    const { t } = useTranslation();
    const { language, changeLanguage } = useAppLanguage();
    const [paths, setPaths] = useState<FilterPath[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type?: "success" | "error" | "info";
        onConfirm?: () => void;
    }>({ isOpen: false, title: "", message: "" });

    useEffect(() => {
        api.getSettings().then((settings) => {
            if (settings.paths) setPaths(settings.paths);
            if (settings.language) changeLanguage(settings.language);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLanguageChange = (lang: string) => {
        changeLanguage(lang);
    };

    const handleOpenPermissionSettings = () => {
        api.openPermissionSettings();
    };

    const addPath = () => {
        if (paths.length >= 9) {
            setModal({
                isOpen: true,
                title: "Limit Reached",
                message: t("settings.limitReached", {
                    defaultValue: "You can only add up to 9 paths.",
                }),
                type: "info",
            });
            return;
        }

        setPaths([
            ...paths,
            {
                id: crypto.randomUUID(),
                name: "New Folder",
                path: "",
                icon: "Folder",
            },
        ]);
    };

    const removePath = (id: string) => {
        setPaths(paths.filter((p) => p.id !== id));
    };

    const updatePath = (updatedPath: FilterPath) => {
        setPaths(paths.map((p) => (p.id === updatedPath.id ? updatedPath : p)));
    };

    const browsePath = async (id: string) => {
        const selected = await api.selectFolder();
        if (selected) {
            setPaths(
                paths.map((p) =>
                    p.id === id ? { ...p, path: selected } : p
                )
            );
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setPaths((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const saveSettings = () => {
        const validPaths = paths.filter((p) => p.path && p.path.trim() !== "");
        setPaths(validPaths);

        api.saveSettings({
            paths: validPaths,
            language: language,
        });

        setModal({
            isOpen: true,
            title: t("settings.saveSuccessTitle"),
            message: t("settings.saveSuccessDesc"),
            type: "success",
        });
    };

    const langOptions = [
        { label: "English", value: "en" },
        { label: "한국어", value: "ko" },
        { label: "Français", value: "fr" },
    ];

    const getLanguageLabel = (val: string) =>
        langOptions.find((o) => o.value === val)?.label || "English";

    return (
        <div className="min-h-screen bg-[#191919] text-white font-sans selection:bg-blue-500/30">
            <ConfirmModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                currentAlert={{ type: modal.type || "info" }}
                onConfirm={modal.onConfirm}
                onCancel={() => setModal({ ...modal, isOpen: false })}
            />

            <BottomMenu
                isOpen={isLangMenuOpen}
                onClose={() => setIsLangMenuOpen(false)}
                title={t("settings.language")}
                options={langOptions}
                selectedValue={language}
                onSelect={handleLanguageChange}
            />

            <div className="max-w-3xl mx-auto p-6 md:p-10 flex flex-col h-screen">
                {/* Global Draggable Area at very top */}
                <div className="absolute top-0 left-0 right-0 h-6 draggable z-500" />
                <SettingsHeader key={language} />

                {/* Banner container: Permissions + Language + Tip */}
                <div className="mb-5 flex flex-col gap-3">
                    {/* Permission + Language Row */}
                    <div className="flex gap-3">
                        {/* Permission Banner (Flexible width) */}
                        <div className="flex-1 p-4 bg-[#252525] rounded-[20px] flex items-center justify-between gap-3 transition-all hover:bg-[#2a2a2a]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[14px] bg-[#333] flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle
                                        size={18}
                                        className="text-blue-500"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-[14px] leading-tight mb-0.5">
                                        {t("settings.permissionWarningTitle")}
                                    </span>
                                    <span className="text-[#8b95a1] text-[12px] font-medium">
                                        {t("settings.permissionWarningDesc")}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleOpenPermissionSettings}
                                className="px-3.5 py-2 bg-[#333] hover:bg-[#3e3e3e] text-blue-500 rounded-[10px] text-[13px] font-bold flex items-center gap-1.5 flex-shrink-0 transition-all active:scale-95 focus:outline-none"
                            >
                                {t("settings.openPermissions")}
                                <ExternalLink size={13} />
                            </button>
                        </div>

                        {/* Language Button (Fixed width/square-ish) */}
                        <button
                            onClick={() => setIsLangMenuOpen(true)}
                            className="p-4 bg-[#252525] rounded-[20px] flex flex-col items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-all active:scale-95 group w-[100px]"
                        >
                            <div className="w-10 h-10 rounded-[14px] bg-[#333] flex items-center justify-center group-hover:bg-[#3e3e3e] transition-colors">
                                <Globe size={20} className="text-gray-300" />
                            </div>
                            <span className="text-[12px] font-bold text-gray-400 group-hover:text-white transition-colors">
                                {getLanguageLabel(language)}
                            </span>
                        </button>
                    </div>

                    {/* Tip Banner */}
                    <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-[20px] flex items-center gap-3 border border-blue-500/10">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 font-bold text-xs">
                                TIP
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-blue-200 font-bold text-[13px]">
                                {t("settings.tipTitle")}
                            </span>
                            <span className="text-blue-200/60 text-[11px]">
                                {t("settings.tipDesc")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4 scrollbar-hide">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={paths.map((p) => p.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {paths.map((path) => (
                                <SortablePathItem
                                    key={path.id}
                                    path={path}
                                    onUpdate={updatePath}
                                    onRemove={removePath}
                                    onBrowse={browsePath}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <button
                        onClick={addPath}
                        disabled={paths.length >= 9}
                        className={`w-full py-5 rounded-[20px] border-2 border-dashed border-[#333] transition-all font-medium flex items-center justify-center gap-2 focus:outline-none ${
                            paths.length >= 9
                                ? "opacity-50 cursor-not-allowed text-gray-600"
                                : "text-gray-400 hover:border-gray-500 hover:bg-[#252525] hover:text-gray-200"
                        }`}
                    >
                        <FolderPlus size={20} />
                        {paths.length >= 9
                            ? t("settings.maxPathsReached", {
                                  defaultValue: "Max 9 paths reached",
                              })
                            : t("settings.addPath")}
                    </button>

                    <div className="h-4"></div>
                </div>

                <div className="pt-6 border-t border-[#252525] mt-2 flex justify-end">
                    <button
                        onClick={saveSettings}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-[12px] font-bold text-base transition-all flex items-center justify-center focus:outline-none"
                    >
                        {t("popup.saved")}
                    </button>
                </div>
            </div>
        </div>
    );
};
