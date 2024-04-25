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

export default function VideoDonationSwitch() {
  const { data, isLoading } = useDonationsSetting();
  const { activeSetting } = useActiveSetting();
  const { mutate } = useNewsFeed();
  const [openSave, setOpenSave] = useState(false);
  const [openLoad, setOpenLoad] = useState(false);
  const filteredData = useRef<NewsFeed[]>([]);

  const onChangeVideoDonation = async (checked: boolean) => {
    await activeSetting({
      active: checked,
      donationType: "VIDEO",
    });
    toast.success(`영상 후원 ${checked ? "ON" : "OFF"}`);
    // if (!checked) {
    //   checkNewsFeed();
    // } else {
    //   const savedData = JSON.parse(sessionStorage.getItem("newsfeed"));
    //   sessionStorage.removeItem("newsfeed");

    //   if (savedData && savedData.length) {
    //     filteredData.current = savedData;
    //   }
    //   setOpenLoad(true);
    // }
  };

  const checkNewsFeed = async () => {
    filteredData.current = [];
    const newsFeedData = await mutate();

    newsFeedData.forEach((page) => {
      page.content.data.forEach((feed) => {
        if (
          feed.newsFeedType === "DONATION_VIDEO_CURRENCY" &&
          !feed.isPlayed &&
          !feed.isPlaying
        ) {
          filteredData.current.push(feed);
        }
      });
    });

    if (filteredData.current.length > 0) {
      setOpenSave(true);
    }
  };

  const saveNewsFeed = () => {
    sessionStorage.setItem("newsfeed", JSON.stringify(filteredData.current));
  }
  const loadNewsFeed = () => {
    filteredData.current
  }

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
              영상 후원을 다시 켜면 저장된 영상후원을 재생합니다.<br/>
              (주의: 스트리머 도우미를 종료하면 데이터가 날라갑니다.)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={saveNewsFeed}>저장 후 정지</AlertDialogAction>
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={loadNewsFeed}>재생</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
