# server_manager.py
import pystray
from PIL import Image
import threading
import uvicorn
from server import app
import sys
import os
import winreg as reg  # for Windows registry
import win32gui  # you'll need to: pip install pywin32
import win32con
from pathlib import Path

class ServerManager:
    def __init__(self):
        self.server_running = False
        self.server_thread = None
        self.icon = None

    def run_server(self):
        """Run the FastAPI server"""
        self.server_running = True
        uvicorn.run(app, host="127.0.0.1", port=8000)
        self.server_running = False

    def start_server(self):
        """Start the server in a separate thread"""
        if not self.server_running:
            self.server_thread = threading.Thread(target=self.run_server, daemon=True)
            self.server_thread.start()

    def stop_server(self):
        """Stop the server"""
        if self.server_running:
            # Implement proper server shutdown here
            self.server_running = False

    def create_tray_icon(self):
        """Create the system tray icon and menu"""
        # Create or load an icon image (replace with your own .ico file path)
        icon_image = Image.new('RGB', (64, 64), color='red')
        
        def on_quit(icon):
            self.stop_server()
            icon.stop()
            os._exit(0)

        def get_status():
            return "Running" if self.server_running else "Stopped"

        # Create the icon menu
        menu = (
            pystray.MenuItem(f"Status: {get_status()}", lambda: None, enabled=False),
            pystray.MenuItem("Start Server", self.start_server),
            pystray.MenuItem("Stop Server", self.stop_server),
            pystray.MenuItem("Quit", on_quit)
        )

        self.icon = pystray.Icon("AI Server", icon_image, "AI Server", menu)
        return self.icon

    def add_to_startup(self):
        """Add the application to Windows startup"""
        try:
            # Get the path of the current script
            script_path = Path(__file__).resolve()
            
            # Create the registry key
            key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
            
            # Open the registry key
            key = reg.OpenKey(reg.HKEY_CURRENT_USER, key_path, 0, reg.KEY_ALL_ACCESS)
            
            # Set the registry value
            reg.SetValueEx(key, "AI Server Manager", 0, reg.REG_SZ, f'pythonw "{script_path}"')
            
            reg.CloseKey(key)
            return True
        except Exception as e:
            print(f"Failed to add to startup: {e}")
            return False

    def remove_from_startup(self):
        """Remove the application from Windows startup"""
        try:
            key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
            key = reg.OpenKey(reg.HKEY_CURRENT_USER, key_path, 0, reg.KEY_ALL_ACCESS)
            reg.DeleteValue(key, "AI Server Manager")
            reg.CloseKey(key)
            return True
        except Exception as e:
            print(f"Failed to remove from startup: {e}")
            return False

def main():
    # Create server manager instance
    manager = ServerManager()
    
    # Add to startup (comment out if you don't want this)
    manager.add_to_startup()
    
    # Start the server automatically
    manager.start_server()
    
    # Create and run system tray icon
    icon = manager.create_tray_icon()
    icon.run()

if __name__ == "__main__":
    main()