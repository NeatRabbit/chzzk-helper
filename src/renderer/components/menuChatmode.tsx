import {
  MenubarCheckboxItem,
  MenubarContent,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import useLiveSetting from "../electronApi/useLiveSetting";
import { Check } from "lucide-react";

const FOLLOWER_MINUTE = [
  { value: 0, label: "사용 안 함" },
  { value: 5, label: "5분" },
  { value: 10, label: "10분" },
  { value: 30, label: "30분" },
  { value: 60, label: "1시간" },
  { value: 1440, label: "1일" },
  { value: 10080, label: "1주일" },
  { value: 43200, label: "1개월" },
];

export default function MenuChatmode() {
  const { useGetLiveSetting, setLiveSetting } = useLiveSetting();
  const { data, isLoading, mutate } = useGetLiveSetting();
  const { chatAvailableGroup, minFollowerMinute } = data?.content ?? {};

  const changeChatAvailable = async ({
    group,
    minuate = data.content.minFollowerMinute,
  }: {
    group: "ALL" | "FOLLOWER" | "MANAGER";
    minuate?: number;
  }) => {
    await setLiveSetting({
      mutate,
      data,
      liveSetting: {
        chatAvailableGroup: group,
        minFollowerMinute: minuate,
      },
    });
  };

  return (
    !isLoading && (
      <MenubarMenu>
        <MenubarTrigger>채팅 권한</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem
            checked={chatAvailableGroup === "ALL"}
            onClick={() => changeChatAvailable({ group: "ALL" })}
          >
            모든 사용자
          </MenubarCheckboxItem>
          <MenubarSub>
            <MenubarSubTrigger className="pl-8 relative">
              {chatAvailableGroup === "FOLLOWER" && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <span data-state="checked">
                    <Check className="h-4 w-4" />
                  </span>
                </span>
              )}
              팔로워 전용
            </MenubarSubTrigger>
            <MenubarSubContent>
              {FOLLOWER_MINUTE.map((min) => (
                <MenubarCheckboxItem
                  key={min.value}
                  checked={
                    chatAvailableGroup === "FOLLOWER" &&
                    minFollowerMinute === min.value
                  }
                  onClick={() =>
                    changeChatAvailable({
                      group: "FOLLOWER",
                      minuate: min.value,
                    })
                  }
                >
                  {min.label}
                </MenubarCheckboxItem>
              ))}
            </MenubarSubContent>
          </MenubarSub>
          <MenubarCheckboxItem
            checked={chatAvailableGroup === "MANAGER"}
            onClick={() => changeChatAvailable({ group: "MANAGER" })}
          >
            운영자 전용
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    )
  );
}
