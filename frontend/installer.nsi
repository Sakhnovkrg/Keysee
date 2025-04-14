!define PRODUCT_NAME "Keysee"
!define PRODUCT_VERSION "1.0.0"
!define COMPANY_NAME "Alexandr Sakhnov"
!define WEBSITE_URL "https://sakhnovkrg.github.io/Keysee/"

!define INSTALL_DIR "$LOCALAPPDATA\${PRODUCT_NAME}"
!define UNINSTALL_EXE "$INSTDIR\Uninstall.exe"
!define START_MENU_FOLDER "$SMPROGRAMS\${PRODUCT_NAME}"

!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_FUNCTION "LaunchApp"

!include "MUI2.nsh"

Name "${PRODUCT_NAME}"
OutFile "${PRODUCT_NAME}-${PRODUCT_VERSION}-Installer.exe"

InstallDir "${INSTALL_DIR}"
InstallDirRegKey HKCU "Software\${PRODUCT_NAME}" "InstallPath"
RequestExecutionLevel user

SetCompress auto
SetCompressor lzma

!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Russian"

LangString MUI_FINISHPAGE_RUN_TEXT ${LANG_ENGLISH} "Run ${PRODUCT_NAME}"
LangString MUI_FINISHPAGE_RUN_TEXT ${LANG_RUSSIAN} "Запустить ${PRODUCT_NAME}"

LangString MUI_DIRECTORYPAGE_TEXT_TOP ${LANG_ENGLISH} "Choose the folder in which to install ${PRODUCT_NAME}."
LangString MUI_DIRECTORYPAGE_TEXT_TOP ${LANG_RUSSIAN} "Выберите папку, в которую установить ${PRODUCT_NAME}."

LangString MUI_FINISHPAGE_TEXT ${LANG_ENGLISH} "${PRODUCT_NAME} has been installed on your computer."
LangString MUI_FINISHPAGE_TEXT ${LANG_RUSSIAN} "${PRODUCT_NAME} был установлен на ваш компьютер."

Section "Install"
  SetOutPath $INSTDIR
  File /r "release\win-unpacked\*.*"

  CreateShortcut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\keysee.exe" "" "$INSTDIR\keysee.exe" 0
  CreateDirectory "${START_MENU_FOLDER}"
  CreateShortcut "${START_MENU_FOLDER}\${PRODUCT_NAME}.lnk" "$INSTDIR\keysee.exe" "" "$INSTDIR\keysee.exe" 0

  WriteUninstaller "${UNINSTALL_EXE}"

  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "${UNINSTALL_EXE}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "Publisher" "${COMPANY_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\keysee.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "URLInfoAbout" "${WEBSITE_URL}"
  WriteRegStr HKCU "Software\${PRODUCT_NAME}" "InstallPath" "$INSTDIR"
SectionEnd

Section "Uninstall"
  nsExec::ExecToStack 'taskkill /IM "keysee.exe" /F'
  Pop $0
  Pop $1

  StrCmp $0 0 +3
    DetailPrint "keysee.exe could not be killed"
    Goto next

  DetailPrint "keysee.exe killed successfully"
  Sleep 500

  next:
  nsExec::ExecToStack 'taskkill /IM "keysee-backend.exe" /F'
  Pop $0
  Pop $1

  StrCmp $0 0 +3
    DetailPrint "keysee-backend.exe could not be killed"
    Goto continue

  DetailPrint "keysee-backend.exe killed successfully"
  Sleep 1500

  continue:
  Delete "$INSTDIR\*.*"
  RMDir /r "$INSTDIR"

  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  Delete "${START_MENU_FOLDER}\${PRODUCT_NAME}.lnk"
  RMDir "${START_MENU_FOLDER}"

  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
  DeleteRegKey HKCU "Software\${PRODUCT_NAME}"
SectionEnd

Function LaunchApp
  Exec "$INSTDIR\keysee.exe"
FunctionEnd
