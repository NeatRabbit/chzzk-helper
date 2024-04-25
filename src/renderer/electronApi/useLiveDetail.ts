import useSWR from "swr";
import useUserIdHash from "./useUserIdHash";

const getLiveDetailFetcher = ([userIdHash]: [string, string]) =>
  window.electronApi.getLiveDetail(userIdHash);

export default function useLiveDetail() {
  const { data } = useUserIdHash();

  return useSWR([data.content.userIdHash, "getLiveDetail"], getLiveDetailFetcher, {
    refreshInterval: 5000,
    keepPreviousData: true,
    compare: (a, b) => {
      return a?.content?.openDate === b?.content?.openDate && a?.content?.status === b?.content?.status;
    },
  });
}
