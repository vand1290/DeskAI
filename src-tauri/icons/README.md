# Icons Directory

This directory should contain the application icons for different platforms.

Required icon files:
- 32x32.png
- 128x128.png
- 128x128@2x.png
- icon.icns (macOS)
- icon.ico (Windows)

You can generate these icons using the Tauri CLI:
```
npm install -g @tauri-apps/cli
tauri icon path/to/your/icon.png
```

For development and testing, Tauri will use default icons if these are not present.
