import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { LanguageProvider } from "./contexts/LanguageContext";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <I18nextProvider i18n={i18n}>
        <LanguageProvider>
            <App />
        </LanguageProvider>
    </I18nextProvider>
);
