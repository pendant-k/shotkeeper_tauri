import { useState } from "react";
import { Lightbulb } from "@phosphor-icons/react";
import { useTranslation, Trans } from "react-i18next";

export const SettingsHeader = () => {
    const { t } = useTranslation();
    const [showTip, setShowTip] = useState(false);

    return (
        <header className="mb-8 animate-fade-in-up flex items-start justify-between draggable select-none">
            <div className="pointer-events-none">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-white">
                    ShotKeeper
                </h1>
                <p className="text-slate-400 text-lg">{t("header.subtitle")}</p>
            </div>

            <div className="relative no-drag">
                <button
                    onClick={() => setShowTip(!showTip)}
                    className="p-3 bg-[#252525] hover:bg-[#333] rounded-full transition-colors text-yellow-400 shadow-lg cursor-pointer flex items-center justify-center"
                    title={t("header.tipTitle")}
                >
                    <Lightbulb size={24} weight="fill" />
                </button>

                {showTip && (
                    <>
                        <div
                            className="fixed inset-0 z-40 cursor-default"
                            onClick={() => setShowTip(false)}
                        />
                        <div className="absolute right-0 top-14 w-[320px] bg-[#252525] p-5 rounded-2xl shadow-2xl border border-gray-800 z-50 animate-slide-in-down cursor-auto origin-top-right">
                            <div className="text-sm text-gray-300 leading-relaxed">
                                <p className="font-bold text-white mb-2 text-base">
                                    {t("header.tipTitle")}
                                </p>
                                <p className="text-gray-400 mb-2">
                                    <Trans i18nKey="header.tipBody">
                                        macOS 스크린샷{" "}
                                        <strong>'미리보기 썸네일'</strong>을
                                        끄면 캡처 즉시 분류할 수 있습니다.
                                    </Trans>
                                </p>
                                <div className="p-3 bg-[#111] rounded-lg mt-2 text-xs text-blue-300 font-mono">
                                    {t("header.tipCommand")}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};
