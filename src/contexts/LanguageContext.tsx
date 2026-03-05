import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useMemo,
} from "react";
import { useTranslation } from "react-i18next";

interface LanguageContextType {
    language: string;
    changeLanguage: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language || "en");

    // Sync local state when i18n changes externally (e.g. initial load)
    useEffect(() => {
        const handleLanguageChanged = (lng: string) => {
            setLanguage(lng);
        };
        i18n.on("languageChanged", handleLanguageChanged);
        return () => {
            i18n.off("languageChanged", handleLanguageChanged);
        };
    }, [i18n]);

    const changeLanguage = useCallback(
        (lang: string) => {
            i18n.changeLanguage(lang);
            setLanguage(lang);
        },
        [i18n]
    );

    const contextValue = useMemo(
        () => ({ language, changeLanguage }),
        [language, changeLanguage]
    );

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
