import { Input } from "@/components/ui/input";
import useLiveSetting from "../electronApi/useLiveSetting";
import CategorySelector, { Category } from "./categorySelector";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import useUserIdHash from "../electronApi/useUserIdHash";
import { toast } from "sonner"
import TagSelector from "./tagSelector";
import TagList from "./tagList";

export default function LiveSetting() {
  const { useGetLiveSetting, setLiveSetting } = useLiveSetting();
  const { data: {content: {userIdHash}} } = useUserIdHash();
  const { data, mutate, isLoading } = useGetLiveSetting();
  const [liveTitle, setLiveTitle] = useState("");
  const [categorySelected, setCategorySelected] = useState<Category>({
    value: null,
    label: "",
    categoryType: null,
  });
  const [adult, setAdult] = useState(false);
  const [paidPromotion, setPaidPromotion] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [clipActive, setClipActive] = useState(false);

  const onChangeSelected = (value: Category) => {
    setCategorySelected(value);
  };

  useEffect(() => {
    setLiveTitle(data?.content.defaultLiveTitle || "");
    setAdult(!!data?.content.adult);
    setPaidPromotion(!!data?.content.paidPromotion);
    setTags(data?.content.tags || []);
    setClipActive(data?.content.clipActive);
  }, [data])

  const onSubmit = async () => {
    if (!liveTitle) {
      toast.error("방송 제목을 입력해주세요.");
      return;
    }
    
    await setLiveSetting({mutate, data, liveSetting: {
      adult,
      defaultLiveTitle: liveTitle,
      liveCategory: categorySelected.value,
      categoryType: categorySelected.categoryType,
      paidPromotion,
      tags,
    }});
  }

  return !isLoading && (
    <div className="flex-1 overflow-hidden">
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
          pressed={paidPromotion}
          onPressedChange={setPaidPromotion}
          variant="outline"
          className="text-nowrap hover:bg-inherit data-[state=on]:bg-primary"
        >
          유료
        </Toggle>
        <Toggle
          defaultChecked={data?.content?.adult}
          pressed={adult}
          onPressedChange={setAdult}
          variant="outline"
          className="text-nowrap hover:bg-inherit data-[state=on]:bg-red-700"
        >
          19금
        </Toggle>
        <Toggle
          defaultChecked={data?.content?.clipActive}
          pressed={clipActive}
          onPressedChange={setClipActive}
          variant="outline"
          className="text-nowrap hover:bg-inherit data-[state=on]:bg-primary"
        >
          클립
        </Toggle>
      </div>
      <div className="flex items-center w-full gap-2 mt-2 overflow-hidden flex-1">
        <TagSelector className="ml-2" onAddTag={(tag) => {
          if (tags.length > 4) {
            toast.error("태그는 최대 5개까지만 추가할 수 있습니다.");
            return;
          }
          const newSet = new Set([...tags, tag]);
          setTags(Array.from(newSet));
        }} />
        <TagList tags={tags} onClickRemove={(tag) => {
          const newSet = new Set(tags);
          newSet.delete(tag);
          setTags(Array.from(newSet));
        }} />
        <Button className="font-bold ml-auto" onClick={onSubmit}>저장</Button>
      </div>
    </div>
  );
}
