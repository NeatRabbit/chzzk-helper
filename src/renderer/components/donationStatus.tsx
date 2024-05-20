import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SkipForward } from "lucide-react";
import { useState, useEffect } from "react";
import useUserIdHash from "../electronApi/useUserIdHash";
import { NewsFeed } from "@/main/chzzkApi";

export default function DonationStatus() {
  const [donationChat, setDonationChat] = useState<NewsFeed>(null);
  const [donationVideo, setDonationVideo] = useState<NewsFeed>(null);
  const {data: {content: {userIdHash}}} = useUserIdHash();

  useEffect(() => {
    if (userIdHash) {
      window.electronApi.connectWebsocket(userIdHash);
    }
  }, [userIdHash]);
  window.electronApi.onNewsFeed((data) => {
    if (data.newsFeedType === "DONATION_CHAT_CURRENCY") {
      if (data?.isPlaying) {
        setDonationChat(data);
      }
    }
    if (data.newsFeedType === "DONATION_VIDEO_CURRENCY") {
      if (data?.isPlaying) {
        setDonationVideo(data);
      }
    }
  });

  return (
    <div className="flex h-10 items-center gap-2 px-3 text-sm border-b">
      <div>채팅 후원</div>
      <div><Button size="sm"><SkipForward size={16} /></Button></div>
      <div><strong>{donationChat?.user?.nickname}</strong></div>
      <div className="flex-1 overflow-hidden whitespace-nowrap"><span className="animate-marquee">{donationChat?.donationText}</span></div>
      <Separator orientation="vertical" />
      <div>영상 후원</div>
      <div><Button size="sm"><SkipForward size={16} /></Button></div>
      <div><strong>{donationVideo?.user?.nickname}</strong></div>
      <div className="flex-1 overflow-hidden whitespace-nowrap"><span className="animate-marquee">{donationVideo?.donationText}</span></div>
    </div>
  )
}