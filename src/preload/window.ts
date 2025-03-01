import { ipcRenderer } from "electron";
import { WindowApi } from "@/shared/types/ipc";

export const windowApi: WindowApi = {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
}