import { Switch } from "@/components/ui/switch";
import useDonationsSetting from "../electronApi/useDonationsSetting";
import useActiveSetting from "../electronApi/useActiveSetting";
import { useToast } from "@/components/ui/use-toast";

export default function VideoDonationSwitch() {
  const { data, isLoading } = useDonationsSetting();
  const { activeSetting } = useActiveSetting();
  const {toast} = useToast();

  const onChangeVideoDonation = async (checked: boolean) => {
    await activeSetting({
      active: checked,
      donationType: "VIDEO",
    });
    toast({description: `영상 후원 ${checked ? "ON" : "OFF"}`, duration: 1000});
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <label className="flex gap-2 select-none cursor-pointer">
      <span>영상 후원</span>
      <Switch
        checked={data.content.videoDonationActive}
        onCheckedChange={onChangeVideoDonation}
      />
    </label>
  );
}
