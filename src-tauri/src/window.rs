use tauri::{AppHandle, Manager};

/// 커서 위치 기준으로 팝업을 모니터 중앙에 배치
pub fn center_popup_on_cursor_monitor(app: &AppHandle, width: f64, height: f64) {
    if let Some(popup) = app.get_webview_window("popup") {
        if let Ok(cursor_pos) = popup.cursor_position() {
            let monitors = popup.available_monitors().unwrap_or_default();
            let target_monitor = monitors.iter().find(|m| {
                let pos = m.position();
                let size = m.size();
                let x = cursor_pos.x as i32;
                let y = cursor_pos.y as i32;
                x >= pos.x
                    && x < pos.x + size.width as i32
                    && y >= pos.y
                    && y < pos.y + size.height as i32
            });

            if let Some(monitor) = target_monitor {
                let mon_pos = monitor.position();
                let mon_size = monitor.size();
                let scale = monitor.scale_factor();
                let cx = mon_pos.x as f64 + (mon_size.width as f64 / scale - width) / 2.0;
                let cy = mon_pos.y as f64 + (mon_size.height as f64 / scale - height) / 2.0;
                let _ = popup.set_position(tauri::Position::Logical(
                    tauri::LogicalPosition::new(cx, cy),
                ));
            } else {
                let _ = popup.center();
            }
        } else {
            let _ = popup.center();
        }
    }
}

/// 팝업 숨기기 + 스크린샷 경로 초기화
pub fn dismiss_popup(app: &AppHandle) {
    if let Some(popup) = app.get_webview_window("popup") {
        let _ = popup.hide();
    }
    crate::screenshot::set_current_screenshot_path(None);
}
