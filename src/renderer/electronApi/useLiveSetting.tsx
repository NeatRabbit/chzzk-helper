import useSWR from "swr";
import useUserIdHash from "./useUserIdHash";

const getLiveSettingFetcher = ([userIdHash]: [string, string]) => window.electronApi.getLiveSetting(userIdHash);
const getCategoryFetcher = ([searchString]: [string, string]) => window.electronApi.getCategory(encodeURI(searchString));


export default function useLiveSetting() {
  const {data} = useUserIdHash();

  return {
    useGetLiveSetting: () => useSWR([data.content.userIdHash, "useGetLiveSetting"], getLiveSettingFetcher),
    useGetCategory: (searchString: string) => useSWR([searchString, "useGetCategory"], getCategoryFetcher)
  };
}