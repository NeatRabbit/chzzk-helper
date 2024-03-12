// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import {
  DonationsSetting,
  UserStatus,
  ActiveSettingOption,
  chzzkResponse,
  LiveSettingResponse,
  CategoryResponse,
  LiveSettingOptions,
} from "./main/chzzkApi";

declare global {
  interface Window {
    electronApi: typeof exposes;
  }
}

const exposes = {
  getUserStatus: async (): Promise<UserStatus> =>
    ipcRenderer.invoke("getUserStatus"),
  getDonationsSetting: async (userIdHash: string): Promise<DonationsSetting> =>
    ipcRenderer.invoke("getDonationsSetting", userIdHash),
  activeSetting: async (
    userIdHash: string,
    options: ActiveSettingOption
  ): Promise<chzzkResponse> =>
    ipcRenderer.invoke("activeSetting", userIdHash, options),
  getLiveSetting: async (userIdHash: string): Promise<LiveSettingResponse> =>
    ipcRenderer.invoke("getLiveSetting", userIdHash),
  getCategory: async (searchString: string): Promise<CategoryResponse> =>
    ipcRenderer.invoke("getCategory", searchString),
  setLiveSetting: async (
    userIdHash: string,
    options: LiveSettingOptions
  ): Promise<LiveSettingResponse> =>
    ipcRenderer.invoke("setLiveSetting", userIdHash, options),
};

contextBridge.exposeInMainWorld("electronApi", exposes);
