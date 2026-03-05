mod screenshot;
mod settings;
mod tray;
mod watcher;
mod window;

use tauri::Manager;

#[tauri::command]
fn get_settings(app: tauri::AppHandle) -> settings::Settings {
    settings::get_settings(&app)
}

#[tauri::command]
fn save_settings(app: tauri::AppHandle, paths: Vec<settings::FilterPath>, language: String) {
    let old_settings = settings::get_settings(&app);
    let new_settings = settings::Settings {
        paths,
        language: language.clone(),
    };
    settings::save_settings(&app, &new_settings);

    if old_settings.language != language {
        tray::update_tray(&app, &language);
    }
}

#[tauri::command]
async fn select_folder(app: tauri::AppHandle) -> Option<String> {
    use tauri_plugin_dialog::DialogExt;

    let folder = app.dialog().file().blocking_pick_folder();
    folder.map(|f| f.to_string())
}

#[tauri::command]
async fn close_popup(app: tauri::AppHandle) {
    window::dismiss_popup(&app);
}

#[tauri::command]
async fn resize_popup(app: tauri::AppHandle, width: f64, height: f64) {
    if let Some(popup) = app.get_webview_window("popup") {
        let _ = popup.set_size(tauri::Size::Logical(tauri::LogicalSize::new(width, height)));
    }
    window::center_popup_on_cursor_monitor(&app, width, height);
}

#[tauri::command]
async fn check_permission() -> Result<serde_json::Value, String> {
    if let Some(desktop) = dirs::desktop_dir() {
        match std::fs::read_dir(&desktop) {
            Ok(_) => Ok(serde_json::json!({ "granted": true })),
            Err(_) => Ok(serde_json::json!({ "granted": false })),
        }
    } else {
        Ok(serde_json::json!({ "granted": false }))
    }
}

#[tauri::command]
async fn open_permission_settings(app: tauri::AppHandle) {
    #[allow(deprecated)]
    let _ = tauri_plugin_shell::ShellExt::shell(&app).open(
        "x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Privacy_AllFiles",
        None,
    );
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_settings,
            select_folder,
            close_popup,
            resize_popup,
            check_permission,
            open_permission_settings,
            screenshot::save_screenshot,
            screenshot::copy_to_clipboard,
        ])
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Check if this is first run
            let is_first_run = !settings::has_existing_settings(&app_handle);
            let current_settings = settings::get_settings(&app_handle);

            // Create tray
            tray::create_tray(&app_handle, &current_settings.language)
                .expect("Failed to create tray");

            if is_first_run {
                // First run: show settings window
                tray::show_settings_window(&app_handle);
            } else {
                // Subsequent run: tray-only mode
                if let Some(settings_win) = app.get_webview_window("settings") {
                    let _ = settings_win.hide();
                }
                #[cfg(target_os = "macos")]
                {
                    app.set_activation_policy(tauri::ActivationPolicy::Accessory);
                }
            }

            // Setup file watcher
            let watcher_handle = watcher::setup_watcher(app_handle.clone())
                .expect("Failed to setup file watcher");
            app.manage(std::sync::Mutex::new(Some(watcher_handle)));

            // Handle settings window close -> hide instead
            let app_handle2 = app.handle().clone();
            if let Some(settings_win) = app.get_webview_window("settings") {
                settings_win.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(win) = app_handle2.get_webview_window("settings") {
                            let _ = win.hide();
                        }
                        #[cfg(target_os = "macos")]
                        {
                            let _ = app_handle2
                                .set_activation_policy(tauri::ActivationPolicy::Accessory);
                        }
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
