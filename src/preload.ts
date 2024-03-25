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
  SessionUrlResponse,
  StreamingInfoResponse,
  NewsFeed,
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
  getSessionUrl: async (id: string): Promise<SessionUrlResponse> =>
    ipcRenderer.invoke("getSessionUrl", id),
  getStreamingInfo: async (userIdHash: string): Promise<StreamingInfoResponse> =>
    ipcRenderer.invoke("getStreamingInfo", userIdHash),
  logOut: async () =>
    ipcRenderer.invoke("logOut"),
  connectWebsocket: async (userIdHash: string) =>
    ipcRenderer.invoke("connectWebsocket", userIdHash),
  onNewsFeed: (callback: (value: NewsFeed) => void) => {
    ipcRenderer.removeAllListeners("newsFeed");
    ipcRenderer.on("newsFeed", (_event, value: NewsFeed) => callback(value))
  },
};

contextBridge.exposeInMainWorld("electronApi", exposes);
