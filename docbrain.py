import os
import sys
import subprocess
import webbrowser
import time
import tkinter as tk
from tkinter import messagebox, ttk
import threading

class DocuBrainApp:
    def __init__(self, root):
        self.root = root
        self.root.title("DocuBrain Starter")
        self.root.geometry("500x400")
        self.root.configure(bg='#f0f2f6')
        
        # Center the window
        try:
            self.root.eval('tk::PlaceWindow . center')
        except Exception:
            pass
        
        # Add a label
        label = tk.Label(root, text="DocuBrain Starter", font=("Arial", 18, "bold"), bg='#f0f2f6', fg='#262730')
        label.pack(pady=10)
        
        # Add status label
        self.status_label = tk.Label(root, text="Ready", font=("Arial", 12), bg='#f0f2f6')
        self.status_label.pack(pady=5)
        
        # Add progress bar
        self.progress = ttk.Progressbar(root, orient="horizontal", length=300, mode="determinate")
        self.progress.pack(pady=10)
        
        # Add buttons
        button_frame = tk.Frame(root, bg='#f0f2f6')
        button_frame.pack(pady=20)
        
        self.start_button = tk.Button(button_frame, text="Start DocuBrain", command=self.start_services, 
                            bg='#4f8bf9', fg='white', font=("Arial", 12), padx=20, pady=10)
        self.start_button.pack(side=tk.LEFT, padx=10)
        
        self.stop_button = tk.Button(button_frame, text="Stop DocuBrain", command=self.stop_services, 
                           bg='#ff6b6b', fg='white', font=("Arial", 12), padx=20, pady=10)
        self.stop_button.pack(side=tk.LEFT, padx=10)
        
        self.open_button = tk.Button(button_frame, text="Open Web UI", command=self.open_web_ui, 
                           bg='#28a745', fg='white', font=("Arial", 12), padx=20, pady=10)
        self.open_button.pack(side=tk.LEFT, padx=10)
    
    def update_progress(self, value, status):
        self.progress['value'] = value
        self.status_label.config(text=status)
        self.root.update()
    
    def start_services(self):
        def run():
            try:
                # Check if Docker is installed
                self.update_progress(10, "Checking Docker installation...")
                result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
                if result.returncode != 0:
                    messagebox.showerror("Error", "Docker is not installed. Please install Docker Desktop first.")
                    return
                    
                # Get the installation directory
                install_dir = os.path.dirname(os.path.abspath(__file__))
                docker_dir = os.path.join(install_dir, "docker")
                
                # Start Docker services
                self.update_progress(30, "Starting DocuBrain services...")
                subprocess.run(["docker-compose", "up", "-d"], cwd=docker_dir, check=True)
                
                # Wait for services to start
                self.update_progress(70, "Waiting for services to initialize...")
                time.sleep(15)
                
                self.update_progress(100, "Services started successfully!")
                messagebox.showinfo("Success", "DocuBrain services have been started successfully!")
                
            except subprocess.CalledProcessError as e:
                messagebox.showerror("Error", f"Failed to start services: {e}")
            except Exception as e:
                messagebox.showerror("Error", f"An unexpected error occurred: {e}")
        threading.Thread(target=run).start()
    
    def stop_services(self):
        def run():
            try:
                install_dir = os.path.dirname(os.path.abspath(__file__))
                docker_dir = os.path.join(install_dir, "docker")
                self.update_progress(50, "Stopping DocuBrain services...")
                subprocess.run(["docker-compose", "down"], cwd=docker_dir, check=True)
                self.update_progress(100, "Services stopped")
                messagebox.showinfo("Success", "DocuBrain services have been stopped.")
            except subprocess.CalledProcessError as e:
                messagebox.showerror("Error", f"Failed to stop services: {e}")
            except Exception as e:
                messagebox.showerror("Error", f"An unexpected error occurred: {e}")
        threading.Thread(target=run).start()
    
    def open_web_ui(self):
        try:
            webbrowser.open("https://localhost")
            self.status_label.config(text="Web UI opened in browser")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to open web UI: {e}")

def main():
    root = tk.Tk()
    app = DocuBrainApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
