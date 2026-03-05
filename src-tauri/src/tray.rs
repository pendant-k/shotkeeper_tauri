use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager,
};

fn build_tray_menu(
    app: &AppHandle,
    about_label: &str,
    coffee_label: &str,
    prefs_label: &str,
    perms_label: &str,
    quit_label: &str,
) -> Result<Menu<tauri::Wry>, Box<dyn std::error::Error>> {
    let about = MenuItem::with_id(app, "about", about_label, true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let coffee = MenuItem::with_id(app, "coffee", coffee_label, true, None::<&str>)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let preferences = MenuItem::with_id(app, "preferences", prefs_label, true, None::<&str>)?;
    let permissions = MenuItem::with_id(app, "permissions", perms_label, true, None::<&str>)?;
    let sep3 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", quit_label, true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &about,
            &sep1,
            &coffee,
            &sep2,
            &preferences,
            &permissions,
            &sep3,
            &quit,
        ],
    )?;

    Ok(menu)
}

pub fn create_tray(app: &AppHandle, language: &str) -> Result<(), Box<dyn std::error::Error>> {
    let (about_label, coffee_label, prefs_label, perms_label, quit_label) =
        get_tray_labels(language);

    let menu = build_tray_menu(app, &about_label, &coffee_label, &prefs_label, &perms_label, &quit_label)?;

    let _ = TrayIconBuilder::with_id("main-tray")
        .menu(&menu)
        .icon(app.default_window_icon().cloned().unwrap())
        .icon_as_template(true)
        .tooltip("ShotKeeper")
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "about" => {
                use tauri_plugin_dialog::DialogExt;
                let app_clone = app.clone();
                std::thread::spawn(move || {
                    app_clone.dialog()
                        .message("Copyright 2024 Pendant-K.\nAll rights reserved.\n\nKeep your screenshots organized effortlessly.")
                        .title("ShotKeeper v0.1.0")
                        .blocking_show();
                });
            }
            "coffee" => {
                #[allow(deprecated)]
                let _ = tauri_plugin_shell::ShellExt::shell(app)
                    .open("https://www.buymeacoffee.com/behind8486s", None);
            }
            "preferences" => {
                show_settings_window(app);
            }
            "permissions" => {
                #[allow(deprecated)]
                let _ = tauri_plugin_shell::ShellExt::shell(app).open(
                    "x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Privacy_AllFiles",
                    None,
                );
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}

pub fn update_tray(app: &AppHandle, language: &str) {
    let (about_label, coffee_label, prefs_label, perms_label, quit_label) =
        get_tray_labels(language);

    if let Some(tray) = app.tray_by_id("main-tray") {
        if let Ok(menu) = build_tray_menu(app, &about_label, &coffee_label, &prefs_label, &perms_label, &quit_label) {
            let _ = tray.set_menu(Some(menu));
        }
    }
}

fn get_tray_labels(language: &str) -> (String, String, String, String, String) {
    match language {
        "ko" => (
            "ShotKeeper 정보".to_string(),
            "커피 한 잔 사주기 ☕️".to_string(),
            "환경설정...".to_string(),
            "권한 설정...".to_string(),
            "종료".to_string(),
        ),
        "fr" => (
            "À propos de ShotKeeper".to_string(),
            "Offrez-moi un café ☕️".to_string(),
            "Préférences...".to_string(),
            "Autorisations...".to_string(),
            "Quitter".to_string(),
        ),
        _ => (
            "About ShotKeeper".to_string(),
            "Buy me a coffee ☕️".to_string(),
            "Preferences...".to_string(),
            "Permissions...".to_string(),
            "Quit".to_string(),
        ),
    }
}

pub fn show_settings_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("settings") {
        let _ = window.show();
        let _ = window.set_focus();
        #[cfg(target_os = "macos")]
        {
            let _ = app.set_activation_policy(tauri::ActivationPolicy::Regular);
        }
    }
}
