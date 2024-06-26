import useSWR from "swr";
import useUserIdHash from "./useUserIdHash";

const fetcher = ([userIdHash]: [string, string]) => window.electronApi.getDonationsSetting(userIdHash);

export default function useDonationsSetting() {
  const {data: {content: {userIdHash}}} = useUserIdHash();

  return useSWR([userIdHash, "useDonationsSetting"], fetcher);
}