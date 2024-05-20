import { Switch } from "@/components/ui/switch";
import useDonationsSetting from "../electronApi/useDonationsSetting";
import useActiveSetting from "../electronApi/useActiveSetting";
import { toast } from "sonner";

export default function MissionDonationSwitch() {
  const { data, isLoading } = useDonationsSetting();
  const { activeSetting } = useActiveSetting();

  const onChangeMissionDonation = async (checked: boolean) => {
    await activeSetting({
      active: checked,
      donationType: "MISSION",
    });
    toast.success(`미션 후원 ${checked ? "ON" : "OFF"}`);
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <label className="flex gap-2 select-none cursor-pointer">
      <span>미션 후원</span>
      <Switch
        checked={data.content.missionDonationActive}
        onCheckedChange={onChangeMissionDonation}
      />
    </label>
  );
}
