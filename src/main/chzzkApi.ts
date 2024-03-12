import { CookiesSetDetails, IpcMainEvent, net, session } from "electron";

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
    chatAvailableGroup: string,
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