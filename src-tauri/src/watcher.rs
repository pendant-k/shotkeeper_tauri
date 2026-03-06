use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::{Path, PathBuf};
use std::sync::mpsc;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter, Manager};
use unicode_normalization::UnicodeNormalization;

use crate::screenshot::set_current_screenshot_path;

pub struct FileWatcher {
    _watcher: RecommendedWatcher,
}

pub fn setup_watcher(app: AppHandle) -> Result<FileWatcher, Box<dyn std::error::Error>> {
    let (tx, rx) = mpsc::channel();

    let mut watcher = RecommendedWatcher::new(
        move |res: Result<Event, notify::Error>| {
            if let Ok(event) = res {
                let _ = tx.send(event);
            }
        },
        Config::default().with_poll_interval(Duration::from_millis(500)),
    )?;

    // Watch desktop
    if let Some(desktop) = dirs::desktop_dir() {
        if desktop.exists() {
            watcher.watch(&desktop, RecursiveMode::NonRecursive)?;
            println!("[Watcher] Watching: {:?}", desktop);
        }
    }

    // On macOS, also watch ~/Pictures/Screenshots if it exists
    #[cfg(target_os = "macos")]
    {
        if let Some(home) = dirs::home_dir() {
            let screenshots_dir = home.join("Pictures").join("Screenshots");
            if screenshots_dir.exists() {
                let _ = watcher.watch(&screenshots_dir, RecursiveMode::NonRecursive);
                println!("[Watcher] Watching: {:?}", screenshots_dir);
            }
        }
    }

    // On Windows, watch Pictures/Screenshots
    #[cfg(target_os = "windows")]
    {
        if let Some(pictures) = dirs::picture_dir() {
            let screenshots_dir = pictures.join("Screenshots");
            if screenshots_dir.exists() {
                let _ = watcher.watch(&screenshots_dir, RecursiveMode::NonRecursive);
                println!("[Watcher] Watching: {:?}", screenshots_dir);
            }
        }
    }

    // Spawn event processing thread
    let app_handle = app.clone();
    std::thread::spawn(move || {
        let recent_files: Arc<Mutex<Vec<(PathBuf, Instant)>>> =
            Arc::new(Mutex::new(Vec::new()));

        for event in rx {
            if let EventKind::Create(_) = event.kind {
                for path in event.paths {
                    if is_screenshot_file(&path) {
                        let mut recent = recent_files.lock().unwrap();
                        recent.retain(|(_, t)| t.elapsed() < Duration::from_secs(2));

                        if recent.iter().any(|(p, _)| p == &path) {
                            continue;
                        }
                        recent.push((path.clone(), Instant::now()));
                        drop(recent);

                        let path_clone = path.clone();
                        let app_clone = app_handle.clone();
                        std::thread::spawn(move || {
                            std::thread::sleep(Duration::from_millis(800));
                            if path_clone.exists() {
                                handle_screenshot(&app_clone, &path_clone);
                            }
                        });
                    }
                }
            }
        }
    });

    Ok(FileWatcher { _watcher: watcher })
}

fn is_screenshot_file(path: &Path) -> bool {
    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase());

    match extension.as_deref() {
        Some("png") | Some("mov") => {}
        _ => return false,
    }

    let file_name = path
        .file_name()
        .and_then(|n| n.to_str())
        .map(|n| n.nfc().collect::<String>())
        .unwrap_or_default();

    if file_name.starts_with('.') {
        return false;
    }

    file_name.starts_with("Screenshot")
        || file_name.starts_with("\u{C2A4}\u{D06C}\u{B9B0}\u{C0F7}") // 스크린샷
        || file_name.starts_with("Capture")
        || has_date_pattern(&file_name)
}

fn has_date_pattern(name: &str) -> bool {
    let chars: Vec<char> = name.chars().collect();
    if chars.len() < 10 {
        return false;
    }
    for window in chars.windows(10) {
        if window[4] == '-'
            && window[7] == '-'
            && window[0..4].iter().all(|c| c.is_ascii_digit())
            && window[5..7].iter().all(|c| c.is_ascii_digit())
            && window[8..10].iter().all(|c| c.is_ascii_digit())
        {
            return true;
        }
    }
    false
}

fn handle_screenshot(app: &AppHandle, path: &Path) {
    // 파일 생성 시간이 4초 이내인 경우에만 새 스크린샷으로 처리
    if let Ok(metadata) = std::fs::metadata(path) {
        if let Ok(created) = metadata.created() {
            if let Ok(elapsed) = created.elapsed() {
                if elapsed > Duration::from_secs(4) {
                    println!("[Watcher] Skipping old file: {:?} (created {:?} ago)", path, elapsed);
                    return;
                }
            }
        }
    }

    println!("[Watcher] New screenshot detected: {:?}", path);

    let path_str = path.to_string_lossy().to_string();
    set_current_screenshot_path(Some(path_str));

    let data_url = if path.extension().and_then(|e| e.to_str()) == Some("mov") {
        String::new()
    } else {
        match std::fs::read(path) {
            Ok(bytes) => {
                use base64::Engine;
                let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
                format!("data:image/png;base64,{}", b64)
            }
            Err(e) => {
                eprintln!("[Watcher] Error reading screenshot: {}", e);
                return;
            }
        }
    };

    show_popup_at_cursor(app);

    if let Err(e) = app.emit_to("popup", "screenshot-taken", &data_url) {
        eprintln!("[Watcher] Failed to emit screenshot event: {}", e);
    }
}

fn show_popup_at_cursor(app: &AppHandle) {
    crate::window::center_popup_on_cursor_monitor(app, 340.0, 400.0);
    if let Some(popup) = app.get_webview_window("popup") {
        let _ = popup.show();
        let _ = popup.set_focus();
    }
}
