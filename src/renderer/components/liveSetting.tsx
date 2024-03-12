import { Input } from "@/components/ui/input";
import useLiveSetting from "../electronApi/useLiveSetting";
import CategorySelector, { Category } from "./categorySelector";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import useUserIdHash from "../electronApi/useUserIdHash";
import { useToast } from "@/components/ui/use-toast";

export default function LiveSetting() {
  const { useGetLiveSetting } = useLiveSetting();
  const { data: {content: {userIdHash}} } = useUserIdHash();
  const { data, mutate, isLoading } = useGetLiveSetting();
  const [liveTitle, setLiveTitle] = useState("");
  const [categorySelected, setCategorySelected] = useState<Category>({
    value: null,
    label: "",
    categoryType: null,
  });
  const [adult, setAdult] = useState(false);
  const {toast} = useToast();

  const onChangeSelected = (value: Category) => {
    setCategorySelected(value);
  };

  useEffect(() => {
    setLiveTitle(data?.content.defaultLiveTitle || "");
    setAdult(!!data?.content.adult);
  }, [data])

  const onSubmit = async () => {
    if (!liveTitle) {
      toast({description: "방송 제목을 입력해주세요.", variant: "destructive"});
      return;
    }
    const {chatActive, chatAvailableCondition, chatAvailableGroup, defaultThumbnailImageUrl, minFollowerMinute, paidPromotion} = data.content;
    const {code, content} = await window.electronApi.setLiveSetting(userIdHash, {
      adult,
      defaultLiveTitle: liveTitle,
      liveCategory: categorySelected.value,
      categoryType: categorySelected.categoryType,
      chatActive,
      chatAvailableCondition,
      chatAvailableGroup,
      defaultThumbnailImageUrl,
      minFollowerMinute,
      paidPromotion,
    });
    
    if (code === 200) {
      mutate({
        ...data,
        content: {
          ...data.content,
          ...content,
        }
      });
      toast({description: "방송 정보 변경", duration: 1000});
    }
  }

  return !isLoading && (
    <div className="flex items-center w-full gap-2 overflow-hidden">
      <Input
        type="text"
        className="ml-2"
        placeholder="방송 제목"
        title="방송 제목"
        value={liveTitle}
        onChange={(e) => setLiveTitle(e.target.value)}
      />
      <CategorySelector onChangeSelected={onChangeSelected} />
      <Toggle
        defaultChecked={data?.content?.adult}
        pressed={adult}
        onPressedChange={setAdult}
        variant="outline"
        className="text-nowrap hover:bg-inherit data-[state=on]:bg-red-700"
      >
        19금
      </Toggle>
      <Button className="font-bold" onClick={onSubmit}>저장</Button>
    </div>
  );
}
