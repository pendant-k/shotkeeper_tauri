use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FilterPath {
    pub id: String,
    pub name: String,
    pub path: String,
    pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub paths: Vec<FilterPath>,
    pub language: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            paths: Vec::new(),
            language: "en".to_string(),
        }
    }
}

pub fn get_settings(app: &AppHandle) -> Settings {
    let store = app.store("settings.json").expect("Failed to access store");

    let paths: Vec<FilterPath> = store
        .get("paths")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default();

    let language: String = store
        .get("language")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_else(|| "en".to_string());

    Settings { paths, language }
}

pub fn save_settings(app: &AppHandle, settings: &Settings) {
    let store = app.store("settings.json").expect("Failed to access store");

    store.set(
        "paths",
        serde_json::to_value(&settings.paths).unwrap(),
    );
    store.set(
        "language",
        serde_json::to_value(&settings.language).unwrap(),
    );
}

pub fn has_existing_settings(app: &AppHandle) -> bool {
    let settings = get_settings(app);
    !settings.paths.is_empty()
}
