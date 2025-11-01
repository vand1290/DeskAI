!include "MUI2.nsh"
!include "FileFunc.nsh"

!define PRODUCT_NAME "DeskAI"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "DeskAI Team"
!define PRODUCT_WEB_SITE "https://github.com/vand1290/DeskAI"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "DeskAI_Setup.exe"
InstallDir "$LOCALAPPDATA\DeskAI"

!define MUI_ABORTWARNING
!define MUI_ICON "icons\icon.ico"
!define MUI_UNICON "icons\icon.ico"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY

# Custom page to install dependencies
Page custom DependenciesPage

!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Function DependenciesPage
  nsDialogs::Create 1018
  Pop $0
  
  ${NSD_CreateLabel} 0 0 100% 20u "Installing dependencies..."
  Pop $0
  
  ${NSD_CreateLabel} 0 30u 100% 20u "1. Checking Ollama..."
  Pop $1
  
  # Check if Ollama is installed
  ExecWait 'powershell.exe -Command "if (!(Get-Command ollama -ErrorAction SilentlyContinue)) { winget install Ollama.Ollama --silent --accept-package-agreements --accept-source-agreements }"'
  
  ${NSD_CreateLabel} 0 50u 100% 20u "2. Checking Tesseract OCR..."
  Pop $2
  
  # Check if Tesseract is installed
  ExecWait 'powershell.exe -Command "if (!(Test-Path \"C:\Program Files\Tesseract-OCR\tesseract.exe\")) { winget install UB-Mannheim.TesseractOCR --silent --accept-package-agreements --accept-source-agreements }"'
  
  ${NSD_CreateLabel} 0 70u 100% 20u "3. Dependencies installed!"
  Pop $3
  
  nsDialogs::Show
FunctionEnd

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite ifnewer
  
  # Install your application files
  File /r "deskai.exe"
  File /r "resources"
  
  # Create shortcuts
  CreateDirectory "$SMPROGRAMS\DeskAI"
  CreateShortCut "$SMPROGRAMS\DeskAI\DeskAI.lnk" "$INSTDIR\deskai.exe"
  CreateShortCut "$DESKTOP\DeskAI.lnk" "$INSTDIR\deskai.exe"
  
  # Write uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  # Registry entries
  WriteRegStr HKCU "Software\DeskAI" "" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeskAI" "DisplayName" "DeskAI"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeskAI" "UninstallString" "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\deskai.exe"
  Delete "$INSTDIR\Uninstall.exe"
  Delete "$SMPROGRAMS\DeskAI\DeskAI.lnk"
  Delete "$DESKTOP\DeskAI.lnk"
  
  RMDir "$SMPROGRAMS\DeskAI"
  RMDir /r "$INSTDIR"
  
  DeleteRegKey HKCU "Software\DeskAI"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeskAI"
SectionEnd