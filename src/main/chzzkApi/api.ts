import { IpcMainEvent, session } from "electron";
import io from "socket.io-client";
import { getCookies, setCookies } from "../utils/cookies";

export interface chzzkResponse {
  code: number;
  content?: object;
  message?: string;
}

export interface UserStatus extends chzzkResponse {
  content: {
    loggedIn: boolean;
    userIdHash?: string;
  };
}

const chzzkApiClient = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const Cookie = await getCookies(session.defaultSession.cookies);
  const response = await session.defaultSession.fetch(url, {
    method: "GET",
    ...options,
    headers: {
      ...options.headers,
      Cookie,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Whale/3.24.223.21 Safari/537.36",
    },
  });

  setCookies({
    url,
    cookies: response.headers.getSetCookie(),
    session: session.defaultSession,
  });

  return response.json();
};

export const getUserStatus = async (): Promise<UserStatus> => {
  return chzzkApiClient(
    "https://comm-api.game.naver.com/nng_main/v1/user/getUserStatus",
    {
      headers: {
        Origin: "https://chzzk.naver.com",
        Referer: "https://chzzk.naver.com/",
      },
    }
  );
};

const studioHeaders = {
  "Front-Client-Platform-Type": "PC",
  "Front-Client-Product-Type": "web",
  "Content-Type": "application/json",
  Origin: "https://studio.chzzk.naver.com",
};

export interface DonationsSetting extends chzzkResponse {
  content: {
    chatDonationActive?: boolean;
    subscriptionActive?: boolean;
    videoDonationActive?: boolean;
  };
}

export const getDonationsSetting = async (
  _: IpcMainEvent,
  userIdHash: string
): Promise<DonationsSetting> => {
  return chzzkApiClient(
    `https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/donations/setting`,
    {
      headers: {
        Origin: "https://studio.chzzk.naver.com",
      },
    }
  );
};

export interface ActiveSettingOption {
  active: boolean;
  donationType: "VIDEO" | "CHAT";
}

export const activeSetting = async (
  _: IpcMainEvent,
  userIdHash: string,
  options: ActiveSettingOption
): Promise<chzzkResponse> => {
  return chzzkApiClient(
    `https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/donations/active-setting`,
    {
      method: "PUT",
      body: JSON.stringify(options),
      headers: studioHeaders,
    }
  );
};

export interface LiveSettingResponse extends chzzkResponse {
  content: {
    defaultLiveTitle: string;
    category: {
      categoryId: string;
      categoryType: string;
      categoryValue: string;
    };
    defaultThumbnailImageUrl?: string;
    chatActive: boolean;
    chatAvailableGroup: "ALL" | "FOLLOWER" | "MANAGER";
    paidPromotion: boolean;
    adult: boolean;
    chatAvailableCondition: string;
    minFollowerMinute: number;
    tags: string[];
    clipActive: boolean;
  };
}

export const getLiveSetting = async (
  _: IpcMainEvent,
  userIdHash: string
): Promise<LiveSettingResponse> => {
  return chzzkApiClient(
    `https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/live-setting`,
    {
      headers: studioHeaders,
    }
  );
};

export interface LiveSettingOptions {
  defaultLiveTitle: string;
  defaultThumbnailImageUrl?: string;
  categoryType?: string;
  liveCategory: string;
  chatActive: boolean;
  paidPromotion: boolean;
  chatAvailableGroup: string;
  adult: boolean;
  chatAvailableCondition: string;
  minFollowerMinute: number;
  tags: string[];
  clipActive: boolean;
}

export const setLiveSetting = async (
  _: IpcMainEvent,
  userIdHash: string,
  options: LiveSettingOptions
): Promise<LiveSettingResponse> => {
  return chzzkApiClient(
    `https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/live-setting`,
    {
      method: "PUT",
      body: JSON.stringify(options),
      headers: studioHeaders,
    }
  );
};

export interface CategoryResponse extends chzzkResponse {
  content: {
    results: {
      categoryId: string;
      categoryType: string;
      categoryValue: string;
      posterImageUrl: string;
      tags: string[];
    }[];
  };
}

export const getCategory = (
  _: IpcMainEvent,
  searchString: string
): Promise<CategoryResponse> => {
  if (!searchString)
    return Promise.resolve({
      code: 200,
      content: { results: [] },
    });

  return chzzkApiClient(
    `https://api.chzzk.naver.com/manage/v1/auto-complete/categories?keyword=${searchString}&size=10`,
    {
      headers: studioHeaders,
    }
  );
};

export interface SessionUrlResponse extends chzzkResponse {
  content: {
    sessionUrl: string;
  };
}

const getSessionUrl = (id: string): Promise<SessionUrlResponse> => {
  if (!id) throw Error("No id");

  return chzzkApiClient(
    `https://api.chzzk.naver.com/manage/v1/alerts/${id}/session-url`,
    {
      headers: studioHeaders,
    }
  );
};

export interface StreamingInfoResponse extends chzzkResponse {
  content: {
    streamKey: string;
    streamUrl: string;
    chatSourceHash: string;
    donationSessionIOChannelId: string;
    subscriptionSessionIOChannelId: string;
    newsFeedSessionIOChannelId: string;
    videoSessionIOChannelId: string;
  };
}

export const getStreamingInfo = (
  _: IpcMainEvent,
  userIdHash: string
): Promise<StreamingInfoResponse> => {
  if (!userIdHash) throw Error("No userIdHash");

  return chzzkApiClient(
    `https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/streaming-info`,
    {
      headers: studioHeaders,
    }
  );
};

export const commandSkip = (_: IpcMainEvent, userIdHash: string) => {
  if (!userIdHash) throw Error("No userIdHash");

  return chzzkApiClient(
    `https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/donations/command`,
    {
      method: "POST",
      headers: studioHeaders,
      body: JSON.stringify({
        command: "skip",
      }),
    }
  );
};

let newsWS: SocketIOClient.Socket = null;

export interface NewsFeed {
  newsFeedNo: number;
  newsFeedType:
    | "FOLLOW_CHANNEL"
    | "DONATION_CHAT_CURRENCY"
    | "DONATION_VIDEO_CURRENCY"
    | "SUBSCRIPTION_COMPLETION"
    | "SUBSCRIPTION_ALERT"
    | "UNKNOWN";
  message: string;
  user: {
    userIdHash: string;
    nickname: string;
    profileImageUrl?: string;
  };
  createdDate: string;
  donationId?: string;
  videoId?: string;
  startSecond?: number;
  endSecond?: number;
  isPlayed?: boolean;
  isPlaying?: boolean;
  thumbnailImageUrl?: string;
  videoType?: "CHZZK" | "YOUTUBE";
  donationText?: string;
  extraJson: string;
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

// event: donationControl
// data
// {
//     "donationType": string,
//     "donationCommand": string, // PLAY, STOP
//     "donationId": string
// }

export const connectWebsocket = async (
  event: IpcMainEvent,
  newsFeedSessionIOChannelId: string
) => {
  if (!newsFeedSessionIOChannelId) throw Error("No newsFeedSessionIOChannelId");

  const newsFeedUrl = await getSessionUrl(newsFeedSessionIOChannelId);
  const options = {
    reconnection: false,
    forceNew: true,
    "connect timeout": 3e3,
    transports: ["websocket"],
    extraHeaders: {
      origin: "https://chzzk.naver.com",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Whale/3.25.232.19 Safari/537.36",
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
  };

  newsWS = io(newsFeedUrl.content.sessionUrl, options);
  newsWS.on("donation", (data: string) => {
    const donation: NewsFeed = parseData(data);
    event.sender.send("newsFeed", donation);
  });
};

export interface LiveDetailResponse extends chzzkResponse {
  content: {
    openDate: string;
    status: "OPEN" | "CLOSE";
  };
}

export const getLiveDetail = async (
  _: IpcMainEvent,
  userIdHash: string
): Promise<LiveDetailResponse> => {
  return chzzkApiClient(
    `https://api.chzzk.naver.com/service/v2/channels/${userIdHash}/live-detail`,
    {
      headers: studioHeaders,
    }
  );
};

export interface NewsFeedResponse extends chzzkResponse {
  content: {
    data: NewsFeed[];
    page: {
      next: {
        newsFeedNo: number | null;
      };
    };
    size: number;
  };
}

export const getNewsFeed = async (
  _: IpcMainEvent,
  userIdHash: string,
  newsFeedNo?: number
): Promise<NewsFeedResponse> => {
  return chzzkApiClient(
    `https://api.chzzk.naver.com/manage/v1/channels/${userIdHash}/news-feeds?size=20&typeFilters=DONATION${
      newsFeedNo ? `&newsFeedNo=${newsFeedNo}` : ""
    }`,
    {
      headers: studioHeaders,
    }
  );
};

export interface TagResponse extends chzzkResponse {
  content: {
    keywords: string[];
  };
}

export const getTag = async (
  _: IpcMainEvent,
  searchString: string
): Promise<TagResponse> => {
  if (!searchString)
    return Promise.resolve({ code: 200, content: { keywords: [] } });

  return chzzkApiClient(
    `https://api.chzzk.naver.com/service/v1/search/tags/auto-complete?keyword=${searchString}&size=50`,
    {
      headers: studioHeaders,
    }
  );
};

export type DonationsCommandResponse = chzzkResponse;

export interface DonationsCommand {
  channelId: string,
  command: "PLAY" | "STOP" | "IGNORE" | "SKIP",
  donationId?: string
}

export const donationsCommand = async (
  _: IpcMainEvent,
  { channelId, command, donationId }: DonationsCommand,
) => {
  return chzzkApiClient(
    `https://api.chzzk.naver.com/service/v1/channels/${channelId}/donations/command`,
    {
      method: "POST",
      body: JSON.stringify({
        command,
        donationId,
      }),
      headers: studioHeaders,
    }
  );
};
