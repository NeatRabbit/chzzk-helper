import { NewsFeedResponse } from "@/main/chzzkApi";
import useUserIdHash from "./useUserIdHash";
import useSWRInfinite from "swr/infinite";

const getNewsFeedFetcher = ([userIdHash, newsFeedNo]: [string, number?]) =>
  window.electronApi.getNewsFeed(userIdHash, newsFeedNo);

export default function useNewsFeed() {
  const {data: {content: {userIdHash}}} = useUserIdHash();
  const getKey = (pageIndex: number, previousPageData: NewsFeedResponse) => {
    // 끝에 도달
    if (previousPageData && !previousPageData?.content?.page?.next?.newsFeedNo) return null;

    // 재생중 혹은 재생된 영상 후원 존재
    if (previousPageData?.content?.data?.find(value => value?.isPlayed || value?.isPlaying)) return null;
  
    // 첫 페이지, `previousPageData`가 없음
    if (pageIndex === 0) return [userIdHash]
  
    // API의 엔드포인트에 커서를 추가
    return [userIdHash, previousPageData.content.page.next.newsFeedNo];
  }

  return useSWRInfinite(getKey, getNewsFeedFetcher, {
    revalidateAll: true,
  });
}