import useSWR, { KeyedMutator } from "swr";
import useUserIdHash from "./useUserIdHash";
import { LiveSettingOptions, LiveSettingResponse } from "@/main/chzzkApi";
import { toast } from "@/components/ui/use-toast";

const getLiveSettingFetcher = ([userIdHash]: [string, string]) =>
  window.electronApi.getLiveSetting(userIdHash);
const getCategoryFetcher = ([searchString]: [string, string]) =>
  window.electronApi.getCategory(encodeURI(searchString));

export default function useLiveSetting() {
  const { data } = useUserIdHash();

  return {
    useGetLiveSetting: () =>
      useSWR(
        [data.content.userIdHash, "useGetLiveSetting"],
        getLiveSettingFetcher
      ),
    useGetCategory: (searchString: string) =>
      useSWR([searchString, "useGetCategory"], getCategoryFetcher),
    setLiveSetting: async ({
      mutate,
      data: liveSettingData,
      liveSetting,
    }: {
      mutate: KeyedMutator<LiveSettingResponse>;
      data: LiveSettingResponse;
      liveSetting: Partial<LiveSettingOptions>;
    }) => {
      const {
        adult,
        category,
        chatActive,
        chatAvailableCondition,
        chatAvailableGroup,
        defaultLiveTitle,
        defaultThumbnailImageUrl,
        minFollowerMinute,
        paidPromotion,
      } = liveSettingData.content;

      const { code, content } = await window.electronApi.setLiveSetting(
        data.content.userIdHash,
        {
          adult,
          liveCategory: category.liveCategory,
          categoryType: category.categoryType,
          chatActive,
          chatAvailableCondition,
          chatAvailableGroup,
          defaultLiveTitle,
          defaultThumbnailImageUrl,
          minFollowerMinute,
          paidPromotion,
          ...liveSetting,
        }
      );
      if (code === 200) {
        mutate({
          ...data,
          content: {
            ...data.content,
            ...content,
          },
        });
        toast({ description: "방송 정보 변경", duration: 1000 });
      }
    },
  };
}
