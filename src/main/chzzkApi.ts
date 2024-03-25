import { CookiesSetDetails, IpcMain, IpcMainEvent, net, session } from "electron";
import io from "socket.io-client";

export interface chzzkResponse {
  code: number,
  content?: object,
  message?: string,
}

export interface UserStatus extends chzzkResponse {
  content: {
    loggedIn: boolean
    userIdHash?: string
  }
}

const chzzkApiClient = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const Cookie = await getCookies(session.defaultSession.cookies);
  const response = await session.defaultSession.fetch(url, {
    method: "GET",
    ...options,
    headers: {
      ...options.headers,
      Cookie,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Whale/3.24.223.21 Safari/537.36",
    },
  });

  setCookies({url, cookies: response.headers.getSetCookie()});

  return response.json();
}

export const getUserStatus = async (): Promise<UserStatus> => {
  return chzzkApiClient("https://comm-api.game.naver.com/nng_main/v1/user/getUserStatus", {
    headers: {
      Origin: "https://chzzk.naver.com",
      Referer: "https://chzzk.naver.com/",
    }
  });
}

const studioHeaders = {
  "Front-Client-Platform-Type": "PC",
  "Front-Client-Product-Type": "web",
  "Content-Type": "application/json",
  Origin: "https://studio.chzzk.naver.com",
};

export interface DonationsSetting extends chzzkResponse {
  content: {
    chatDonationActive?: boolean,
    subscriptionActive?: boolean,
    videoDonationActive?: boolean,
  }
}

export const getDonationsSetting = async (_: IpcMainEvent, userIdHash: string): Promise<DonationsSetting> => {
  return chzzkApiClient(`https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/donations/setting`, {
    headers: {
      Origin: "https://studio.chzzk.naver.com",
    }
  });
}

export interface ActiveSettingOption {
  active: boolean,
  donationType: "VIDEO" | "CHAT",
}

export const activeSetting = async (_: IpcMainEvent, userIdHash: string, options: ActiveSettingOption): Promise<chzzkResponse> => {
  return chzzkApiClient(`https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/donations/active-setting`, {
    method: "PUT",
    body: JSON.stringify(options),
    headers: studioHeaders,
  });
}

export interface LiveSettingResponse extends chzzkResponse {
  content: {
    defaultLiveTitle: string,
    category: {
      categoryType: string,
      liveCategory: string,
      liveCategoryName: string,
    },
    defaultThumbnailImageUrl?: string,
    chatActive: boolean,
    chatAvailableGroup: "ALL" | "FOLLOWER" | "MANAGER",
    paidPromotion: boolean,
    adult: boolean,
    chatAvailableCondition: string,
    minFollowerMinute: number
  }
}

export const getLiveSetting = async (_: IpcMainEvent, userIdHash: string): Promise<LiveSettingResponse> => {
  return chzzkApiClient(`https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/live-setting`, {
    headers: studioHeaders,
  })
}

export interface LiveSettingOptions {
  defaultLiveTitle: string,
  defaultThumbnailImageUrl?: string,
  categoryType?: string,
  liveCategory: string,
  chatActive: boolean,
  paidPromotion: boolean,
  chatAvailableGroup: string,
  adult: boolean,
  chatAvailableCondition: string,
  minFollowerMinute: number,
}

export const setLiveSetting = async (_: IpcMainEvent, userIdHash: string, options: LiveSettingOptions): Promise<LiveSettingResponse> => {
  return chzzkApiClient(`https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/live-setting`, {
    method: "PUT",
    body: JSON.stringify(options),
    headers: studioHeaders,
  })
}

export interface CategoryResponse extends chzzkResponse {
  content: {
    limit: number,
    lounges: {
      originalLoungeId: string,
      loungeId: string,
      loungeName: string,
      titleImageUrl: string,
      logoImageSquareUrl: string,
      exposureGenre: string,
      repPlatform: string,
      pcLandingUrl: string,
      mobileLandingUrl: string,
      bgColor: string,
      pcBgColor: string,
      mobileBgColor: string,
      createdDate: string,
      updatedDate: string,
      officialLounge: boolean,
    }[],
    offset: number,
    totalCount: number,
  }
}

export const getCategory = (_: IpcMainEvent, searchString: string): Promise<CategoryResponse> => {
  if (!searchString) return Promise.resolve({code: 200, content: {limit: 20, lounges: [], offset: 0, totalCount: 0}});

  return chzzkApiClient(`https://comm-api.game.naver.com/nng_main/v2/search/lounges?keyword=${searchString}&limit=20&orderType=RELEVANCE`, {
    headers: studioHeaders,
  });
}

export interface SessionUrlResponse extends chzzkResponse {
  content: {
    sessionUrl: string
  }
}

const getSessionUrl = (id: string): Promise<SessionUrlResponse> => {
  if (!id) throw Error("No id");

  return chzzkApiClient(`https://api.chzzk.naver.com/manage/v1/alerts/${id}/session-url`, {
    headers: studioHeaders,
  });
}

export interface StreamingInfoResponse extends chzzkResponse {
  content: {
    streamKey: string,
    streamUrl: string,
    chatSourceHash: string,
    donationSessionIOChannelId: string,
    subscriptionSessionIOChannelId: string,
    newsFeedSessionIOChannelId: string,
    videoSessionIOChannelId: string,
  }
}

const getStreamingInfo = (userIdHash: string): Promise<StreamingInfoResponse> => {
  if (!userIdHash) throw Error("No userIdHash");

  return chzzkApiClient(`https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/streaming-info`, {
    headers: studioHeaders,
  });
}

export const commandSkip = (_: IpcMainEvent, userIdHash: string) => {
  if (!userIdHash) throw Error("No userIdHash");

  return chzzkApiClient(`https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/donations/command`, {
    method: "POST",
    headers: studioHeaders,
    body: JSON.stringify({
      command: "skip",
    }),
  });
}

let newsWS: SocketIOClient.Socket = null;

export interface NewsFeed {
  newsFeedNo: number,
  newsFeedType: string,
  message: string,
  user: {
      userIdHash: string,
      nickname: string,
      profileImageUrl?: string
  },
  createdDate: string,
  donationId?: string,
  videoId?: string,
  startSecond?: number,
  endSecond?: number,
  isPlayed?: boolean,
  isPlaying?: boolean,
  thumbnailImageUrl?: string,
  videoType?: string,
  donationText?: string,
  extraJson: "{}"
  // newsFeedNo: 4490920,
  // newsFeedType: "FOLLOW_CHANNEL",
  // message: "겔4스님이 나를 팔로우 했습니다.",
  // user: {
  //     userIdHash: "8ec7498fa7f31276cd8b68b9af70b656",
  //     nickname: "겔4스",
  //     profileImageUrl: null
  // },
  // createdDate: "2024-02-27 06:41:28",
  // donationId: null,
  // videoId: null,
  // startSecond: null,
  // endSecond: null,
  // isPlayed: null,
  // isPlaying: null,
  // thumbnailImageUrl: null,
  // videoType: null,
  // donationText: null,
  // extraJson: "{}"
}

export const connectWebsocket = async (event: IpcMainEvent, userIdHash: string) => {
  if (!userIdHash) throw Error("No userIdHash");

  const streamingInfo = await getStreamingInfo(userIdHash);
  const newsFeedUrl = await getSessionUrl(streamingInfo.content.newsFeedSessionIOChannelId);
  const options = {
    reconnection: false,
    forceNew: true,
    "connect timeout": 3e3,
    transports: ["websocket"],
    extraHeaders: {
      origin: "https://chzzk.naver.com",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Whale/3.25.232.19 Safari/537.36",
    },
  };

  if (newsWS) {
    newsWS.close();
    newsWS = null;
  }

  const parseData = (data: string) => {
    const result = JSON.parse(data);
    result.profile = JSON.parse(result.profile);

    return result;
  }

  newsWS = io(newsFeedUrl.content.sessionUrl, options);
  newsWS.on("donation", (data: string) => {
      const donation: NewsFeed = parseData(data);
    event.sender.send("newsFeed", donation);
  });
}

function setCookies({url, cookies}: {url: string, cookies: string[]}) {
  const promises = cookies.map(cookie => {
    const setCookie: CookiesSetDetails = {
      url,
    };

    cookie.split("; ").map(parts => {
      const part = parts.split("=");
      return {
        key: part[0],
        value: part?.[1],
      };
    }).forEach((part, index) => {
      if (index === 0) {
        setCookie.name = part.key;
        setCookie.value = part.value;
      } else {
        switch (part.key.toLowerCase()) {
          case "domain":
            setCookie.domain = part.value;
            break;
          case "path":
            setCookie.path = part.value;
            break;
          case "samesite":
            setCookie.sameSite = part.value.toLowerCase() as "unspecified" | "no_restriction" | "lax" | "strict";
            break;
          case "expires":
            setCookie.expirationDate = getSecondsSinceEpoch(part.value);
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "httponly":
            setCookie.httpOnly = true;
            break;
        }
      }
    });

    return session.defaultSession.cookies.set(setCookie);
  });

  return Promise.all(promises);
}

function getSecondsSinceEpoch(dateString: string) {
  const date = new Date(dateString);
  return Math.floor(date.getTime() / 1000);
}

// 세션 쿠키를 가져오는 비동기 함수
async function getCookies(sessionCookies: Electron.Cookies): Promise<string> {
  const cookies = await sessionCookies.get({});
  const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';');
  return cookieString;
}