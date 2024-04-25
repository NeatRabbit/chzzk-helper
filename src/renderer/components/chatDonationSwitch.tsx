import { Switch } from "@/components/ui/switch";
import useDonationsSetting from "../electronApi/useDonationsSetting";
import useActiveSetting from "../electronApi/useActiveSetting";
import { toast } from "sonner";

export default function ChatDonationSwitch() {
  const { data, isLoading } = useDonationsSetting();
  const { activeSetting } = useActiveSetting();

  const onChangeChatDonation = async (checked: boolean) => {
    await activeSetting({
      active: checked,
      donationType: "CHAT",
    });
    toast.success(`채팅 후원 ${checked ? "ON" : "OFF"}`);
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
