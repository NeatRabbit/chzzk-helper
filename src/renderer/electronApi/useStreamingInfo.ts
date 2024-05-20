import useSWR from "swr";
import useUserIdHash from "./useUserIdHash";

const getStreamingInfoFetchter = ([userIdHash]: [string, string]) => 
  window.electronApi.getStreamingInfo(userIdHash);

export default function useStreamingInfo () {
  const { data } = useUserIdHash();

  return useSWR([data?.content?.userIdHash, "getStreamingInfo"], getStreamingInfoFetchter);
}