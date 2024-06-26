import useSWR, { KeyedMutator } from "swr";
import useUserIdHash from "./useUserIdHash";
import { LiveSettingOptions, LiveSettingResponse } from "@/main/chzzkApi";
import { toast } from "sonner";

const getLiveSettingFetcher = ([userIdHash]: [string, string]) =>
  window.electronApi.getLiveSetting(userIdHash);
const getCategoryFetcher = ([searchString]: [string, string]) =>
  window.electronApi.getCategory(encodeURI(searchString));
const getTagFetcher = ([searchString]: [string, string]) =>
  window.electronApi.getTag(encodeURI(searchString));

export default function useLiveSetting() {
  const {
    data: {
      content: { userIdHash },
    },
  } = useUserIdHash();

  return {
    useGetLiveSetting: () =>
      useSWR([userIdHash, "useGetLiveSetting"], getLiveSettingFetcher),
    useGetCategory: (searchString: string) =>
      useSWR([searchString, "useGetCategory"], getCategoryFetcher),
    useGetTag: (searchString: string) =>
      useSWR([searchString, "useGetTag"], getTagFetcher),
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
        tags,
        clipActive,
      } = liveSettingData.content;

      const { code, content } = await window.electronApi.setLiveSetting(
        userIdHash,
        {
          adult,
          liveCategory: category.categoryId,
          categoryType: category.categoryType,
          chatActive,
          chatAvailableCondition,
          chatAvailableGroup,
          defaultLiveTitle,
          defaultThumbnailImageUrl,
          minFollowerMinute,
          paidPromotion,
          tags,
          clipActive,
          ...liveSetting,
        }
      );
      if (code === 200) {
        mutate({
          ...liveSettingData,
          content: {
            ...liveSettingData.content,
            ...content,
          },
        });
        toast.success("방송 정보 변경");
      }
    },
  };
}
