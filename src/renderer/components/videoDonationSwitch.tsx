import { useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import useDonationsSetting from "../electronApi/useDonationsSetting";
import useActiveSetting from "../electronApi/useActiveSetting";
import useNewsFeed from "../electronApi/useNewsFeed";
import { NewsFeed } from "@/main/chzzkApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import useUserIdHash from "../electronApi/useUserIdHash";

function* chunkArray<T>(array: T[], chunkSize: number): Generator<T[]> {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

type FilteredNewsFeedData = Pick<
  NewsFeed,
  "donationId" | "message" | "donationText"
>;

export default function VideoDonationSwitch() {
  const { data, isLoading } = useDonationsSetting();
  const { activeSetting } = useActiveSetting();
  const { mutate } = useNewsFeed();
  const [openSave, setOpenSave] = useState(false);
  const [openLoad, setOpenLoad] = useState(false);
  const filteredData = useRef<FilteredNewsFeedData[]>([]);
  const {
    data: {
      content: { userIdHash },
    },
  } = useUserIdHash();
  const [isActive, setIsActive] = useState<boolean>(null);

  const onChangeVideoDonation = async (checked: boolean) => {
    setIsActive(checked);
    if (!checked) {
      const filteredFeedData = await checkNewsFeed();

      if (filteredFeedData.length > 0) {
        return setOpenSave(true);
      }
    } else {
      const savedData: FilteredNewsFeedData[] = JSON.parse(
        sessionStorage.getItem("newsfeed")
      );
      sessionStorage.removeItem("newsfeed");

      if (savedData && savedData.length) {
        filteredData.current = savedData;
        return setOpenLoad(true);
      }
    }
    changeVideoDonation(checked);
  };

  const changeVideoDonation = async (checked?: boolean) => {
    const active = checked !== undefined ? checked : isActive;

    await activeSetting({
      active,
      donationType: "VIDEO",
    });
    toast.success(`영상 후원 ${active ? "ON" : "OFF"}`);
  };

  const checkNewsFeed = async () => {
    const newsFeedData = await mutate();
    const filteredFeedData: NewsFeed[] = [];

    newsFeedData.forEach((page) => {
      const data =
        page?.content?.data?.filter(
          (feed) =>
            feed.newsFeedType === "DONATION_VIDEO_CURRENCY" &&
            !feed.isPlayed &&
            !feed.isPlaying
        ) || [];

      filteredFeedData.push(...data);
    });

    return filteredFeedData;
  };

  const saveNewsFeed = async () => {
    const filteredNewsFeedData = (await checkNewsFeed())
      .map(({ donationId, message, donationText }) => ({
        donationId,
        message,
        donationText,
      }))
      .reverse();
    await stopDonations(filteredNewsFeedData);
    sessionStorage.setItem("newsfeed", JSON.stringify(filteredNewsFeedData));
    toast(`영상 후원 ${filteredNewsFeedData.length}건 정지 및 저장`);
  };
  const stopDonations = async (donations: FilteredNewsFeedData[]) => {
    const chunkGenerator = chunkArray(donations, 5);

    for (const chunk of chunkGenerator) {
      await Promise.all(
        chunk.map(({ donationId }) =>
          window.electronApi.donationsCommand({
            channelId: userIdHash,
            command: "STOP",
            donationId,
          })
        )
      );
    }
    changeVideoDonation();
  };
  const loadNewsFeed = async () => {
    for (const donations of filteredData.current) {
      const { donationId } = donations;
      await window.electronApi.donationsCommand({
        channelId: userIdHash,
        command: "PLAY",
        donationId,
      });
    }
    changeVideoDonation();
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <>
      <label className="flex gap-2 select-none cursor-pointer">
        <span>영상 후원</span>
        <Switch
          checked={data.content.videoDonationActive}
          onCheckedChange={onChangeVideoDonation}
        />
      </label>
      <AlertDialog open={openSave} onOpenChange={setOpenSave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              남은 영상 후원을 저장하고 정지하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              영상 후원을 다시 켜면 저장된 영상후원을 재생합니다.
              <br />
              (주의: 스트리머 도우미를 종료하면 데이터가 날라갑니다.)
              <br />
              (해당 기능은 현재 테스트 단계입니다.)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => changeVideoDonation()}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction onClick={saveNewsFeed}>
              저장 후 정지
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={openLoad} onOpenChange={setOpenLoad}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              저장된 영상 후원을 재생하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              이전 영상 후원 종료 시 저장한 영상후원을 재생합니다.
              <br />
              (해당 기능은 현재 테스트 단계입니다.)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => changeVideoDonation()}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction onClick={loadNewsFeed}>재생</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
