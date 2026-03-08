use std::path::Path;
use std::sync::Mutex;
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

static CURRENT_SCREENSHOT_PATH: Mutex<Option<String>> = Mutex::new(None);

pub fn get_current_screenshot_path() -> Option<String> {
    CURRENT_SCREENSHOT_PATH.lock().unwrap().clone()
}

pub fn set_current_screenshot_path(path: Option<String>) {
    *CURRENT_SCREENSHOT_PATH.lock().unwrap() = path;
}

#[tauri::command]
pub async fn save_screenshot(
    app: AppHandle,
    target_folder_path: String,
    file_name: Option<String>,
) -> Result<(), String> {
    let current_path =
        get_current_screenshot_path().ok_or_else(|| "No screenshot to save".to_string())?;

    let source = Path::new(&current_path);
    if !source.exists() {
        return Err("Source file does not exist".to_string());
    }

    let dest_dir = Path::new(&target_folder_path);
    if !dest_dir.is_dir() {
        return Err("Destination is not a directory".to_string());
    }

    let dest_filename = if let Some(ref name) = file_name {
        if !name.trim().is_empty() {
            let ext = source
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("png");
            format!("{}.{}", name.trim(), ext)
        } else {
            source.file_name().unwrap().to_string_lossy().to_string()
        }
    } else {
        source.file_name().unwrap().to_string_lossy().to_string()
    };

    let dest_path = dest_dir.join(&dest_filename);

    println!("[Save] Moving: {:?} -> {:?}", source, dest_path);

    match std::fs::rename(source, &dest_path) {
        Ok(_) => println!("[Save] Rename successful"),
        Err(_) => {
            std::fs::copy(source, &dest_path).map_err(|e| format!("Copy failed: {}", e))?;
            std::fs::remove_file(source)
                .map_err(|e| format!("Delete original failed: {}", e))?;
            println!("[Save] Copy+Delete successful");
        }
    }

    crate::window::dismiss_popup(&app);

    Ok(())
}

#[tauri::command]
pub async fn copy_to_clipboard(app: AppHandle) -> Result<(), String> {
    let current_path =
        get_current_screenshot_path().ok_or_else(|| "No screenshot to copy".to_string())?;

    let source = Path::new(&current_path);
    if !source.exists() {
        return Err("Source file does not exist".to_string());
    }

    let image_bytes =
        std::fs::read(source).map_err(|e| format!("Failed to read image: {}", e))?;

    let image = tauri::image::Image::from_bytes(&image_bytes)
        .map_err(|e| format!("Failed to parse image: {}", e))?;
    app.clipboard()
        .write_image(&image)
        .map_err(|e| format!("Failed to write to clipboard: {}", e))?;

    println!("[Clipboard] Image copied to clipboard");

    std::fs::remove_file(source).map_err(|e| format!("Failed to delete original: {}", e))?;
    println!("[Clipboard] Original file deleted: {}", current_path);

    crate::window::dismiss_popup(&app);

    Ok(())
}

#[tauri::command]
pub async fn delete_screenshot(app: AppHandle) -> Result<(), String> {
    let current_path =
        get_current_screenshot_path().ok_or_else(|| "No screenshot to delete".to_string())?;

    let source = Path::new(&current_path);
    if source.exists() {
        std::fs::remove_file(source)
            .map_err(|e| format!("Failed to delete screenshot: {}", e))?;
        println!("[Delete] Screenshot deleted: {}", current_path);
    }

    crate::window::dismiss_popup(&app);

    Ok(())
}
