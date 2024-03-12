import { Switch } from "@/components/ui/switch";
import useDonationsSetting from "../electronApi/useDonationsSetting";
import useActiveSetting from "../electronApi/useActiveSetting";
import { useToast } from "@/components/ui/use-toast";

export default function ChatDonationSwitch() {
  const { data, isLoading } = useDonationsSetting();
  const { activeSetting } = useActiveSetting();
  const {toast} = useToast();

  const onChangeChatDonation = async (checked: boolean) => {
    await activeSetting({
      active: checked,
      donationType: "CHAT",
    });
    toast({description: `채팅 후원 ${checked ? "ON" : "OFF"}`, duration: 1000});
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <label className="flex gap-2 select-none cursor-pointer">
      <span>채팅 후원</span>
      <Switch
        checked={data.content.chatDonationActive}
        onCheckedChange={onChangeChatDonation}
      />
    </label>
  );
}
