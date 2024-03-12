import { ActiveSettingOption } from "@/main/chzzkApi";
import useUserIdHash from "./useUserIdHash";
import useDonationsSetting from "./useDonationsSetting";

export default function useActiveSetting() {
  const {data: {content: {userIdHash}}} = useUserIdHash();
  const { data, mutate } = useDonationsSetting();

  return {
    activeSetting: async (options: ActiveSettingOption) => {
      const key = options.donationType === "CHAT" ? "chatDonationActive" : "videoDonationActive";

      return window.electronApi.activeSetting(userIdHash, options)
        .then(response => {
          if (response.code === 200) {
            mutate({
              ...data,
              content: { ...data.content, [key]: options.active },
            });
          }
          return response;
        });
    }
  };
}