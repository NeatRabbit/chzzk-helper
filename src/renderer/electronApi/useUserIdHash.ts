import useSWR from "swr";

const fetcher = () => window.electronApi.getUserStatus();

export default function useUserIdHash() {
  return useSWR("useUserIdHash", fetcher);
}