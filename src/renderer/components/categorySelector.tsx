import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import useLiveSetting from "../electronApi/useLiveSetting";
import { CategoryResponse } from "@/main/chzzkApi";

export interface Category {
  value?: string
  label?: string
  categoryType?: string
}

const ETC_CATEGORY = {
  "\ub370\ubaa8 \uac8c\uc784": {
      category: "demo_game",
      icon: "static/media/icon_category_demo_game.c9d7a23f4a2a19939672.png",
      keywords: ["demo", "\uccb4\ud5d8\ud310", "\ub370\ubaa8\uac8c\uc784"]
  },
  "\uace0\uc804 \uac8c\uc784": {
      category: "classic_game",
      icon: "static/media/icon_category_demo_game.c9d7a23f4a2a19939672.png",
      keywords: ["\uc61b\ub0a0", "\uc608\uc804", "\uace0\uc804\uac8c\uc784"]
  },
  "\uc885\ud569 \uac8c\uc784": {
      category: "various_games",
      icon: "static/media/icon_category_various_games.4853fcca2134985260ed.png",
      keywords: ["\uc885\uac9c", "\uc885\ud569\uac8c\uc784"]
  },
  talk: {
      category: "talk",
      icon: "static/media/icon_category_talk.064ccf706d780ee97712.png",
      keywords: ["\ud1a0\ud06c", "\ud1a1", "\ucc44\ud305", "\uc18c\ud1b5", "chatting", "just", "chatting", "talk"]
  },
  "\uc2a4\ud3ec\uce20": {
      category: "sports",
      icon: "static/media/icon_category_sports.7d6d97dc9fcc72664216.png",
      keywords: ["sports", "\uc57c\uad6c", "\ubc30\uad6c", "\ucd95\uad6c", "\ub18d\uad6c", "\uace8\ud504", "\uc2a4\ud3ec\uce20"]
  },
  ASMR: {
      category: "asmr",
      icon: "static/media/icon_category_asmr.e2bd83a69a4874ebcd3c.png",
      keywords: ["\uc18c\ub9ac", "\uc790\uc728", "\uac10\uac01", "\ucf8c\uac10", "\uc77c\uc0c1\uc18c\uc74c", "\ubc31\uc0c9\uc7a1\uc74c", "ASMR", "asmr"]
  },
  "\uc6b4\ub3d9/\uac74\uac15": {
      category: "health",
      icon: "static/media/icon_category_health.0b5c706f662bfe339d3a.png",
      keywords: ["\ud5ec\uc2a4", "\uc6b4\ub3d9", "\ubb34\uc0b0\uc18c\uc6b4\ub3d9", "\uc720\uc0b0\uc18c\uc6b4\ub3d9", "\ud53c\ud2b8\ub2c8\uc2a4", "\uccb4\uc721", "\ub2e4\uc774\uc5b4\ud2b8", "\uadfc\uc721", "\ud06c\ub85c\uc2a4\ud54f", "\uac74\uac15", "\uc815\uc2e0\uac74\uac15", "\uc2e0\uccb4\uc801", "\uc815\uc2e0\uc801", "\uc0ac\ud68c\uc801", "\uac74\uac15\uad00\ub9ac", "\uc6b4\ub3d9/\uac74\uac15"]
  },
  "\uacfc\ud559/\uae30\uc220": {
      category: "sci_tech",
      icon: "static/media/icon_category_sci_tech.d90fa362b5d325aba439.png",
      keywords: ["\uacfc\ud559", "\uae30\uc220", "science", "technology", "technique", "\uc790\uc5f0\uacfc\ud559", "\uc0ac\ud68c\uacfc\ud559", "\ud615\uc2dd\uacfc\ud559", "\uc751\uc6a9\uacfc\ud559", "\uc5f0\uad6c", "\uc2e4\ud5d8", "IT", "\uacf5\ud559", "\uc774\ub860"]
  },
  "\uc74c\uc545": {
      category: "music",
      icon: "static/media/icon_category_music.b2ea677466d9e16f7527.png",
      keywords: ["music", "\uac00\uc218", "\uc2f1\uc5b4\uc1a1\ub77c\uc774\ud130", "\ud504\ub85c\ub4c0\uc11c", "\uc131\uc545\uac00", "\uc791\uace1\uac00", "\uc791\uc0ac\uac00", "\ubba4\uc9c1", "\uad6d\uc545", "\ub300\uc911\uc74c\uc545", "\ud074\ub798\uc2dd", "\ubbfc\uc694", "\uc74c\uc545"]
  },
  "\uba39\ubc29": {
      category: "mukbang",
      icon: "static/media/icon_category_mukbang.ed5a6b6c7998edd30084.png",
      keywords: ["\uba39\ub294\ubc29\uc1a1", "mukbang", "\ubbf8\uc2dd\uac00", "\ubbf8\uc290\ub7ad", "\uba39\ubc29"]
  },
  "\uc544\ud2b8": {
      category: "art",
      icon: "static/media/icon_category_art.e0c76a8d45571c7b06bc.png",
      keywords: ["art", "\ubbf8\uc220", "\uc608\uc220", "\uadf8\ub9bc", "\ub514\uc790\uc778", "design", "\uc544\ud2b8"]
  },
  "\ubdf0\ud2f0": {
      category: "beauty",
      icon: "static/media/icon_category_beauty.133ba76e812dcde14422.png",
      keywords: ["beauty", "\ud654\uc7a5\ud488", "\ub124\uc77c\uc544\ud2b8", "\ud5e4\uc5b4", "\ub514\uc790\uc778", "design", "\ubdf0\ud2f0"]
  },
  "\uc2dc\uc0ac": {
      category: "news",
      icon: "static/media/icon_category_news.c27d88886cae3b4f1af7.png",
      keywords: ["\ub274\uc2a4", "\uc885\ud569\ub274\uc2a4", "\uc2ec\uce35\ub274\uc2a4", "\uc2dc\uc0ac\ud504\ub85c\uadf8\ub7a8", "\uc815\uce58", "\uacbd\uc81c", "\uc0ac\ud68c", "\uad6d\uc81c", "\ubb38\ud654", "\uc778\ubb3c", "\uc2dc\uc0ac\ub274\uc2a4", "\uc2dc\uc0ac"]
  }
};

export default function CategorySelector({onChangeSelected}: {onChangeSelected: (value: Category) => void}) {
  const {useGetLiveSetting, useGetCategory} = useLiveSetting();
  const {data} = useGetLiveSetting();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Category>({value: null, label: "", categoryType: null});
  const [categories, setCategories] = useState([] as CategoryResponse["content"]["results"]);

  useEffect(() => {
    setSelected({
      value: data?.content?.category?.categoryId,
      label: data?.content?.category?.categoryValue,
      categoryType: data?.content?.category?.categoryType,
    });
  }, [data]);

  useEffect(() => {
    onChangeSelected(selected);
  }, [onChangeSelected, selected]);

  const {data: categoryData} = useGetCategory(search);

  useEffect(() => {
    setCategories(categoryData?.content?.results || []);
  }, [categoryData]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <span
            className="text-ellipsis text-nowrap overflow-hidden"
          >{selected.value
              ? selected.label
              : "카테고리 없음"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="카테고리 검색" value={search} onValueChange={setSearch} />
          <CommandList>
            {/* <CommandEmpty>검색결과가 없습니다.</CommandEmpty> */}
            <CommandGroup>
              <CommandItem onSelect={() => {
                setSelected({
                  value: null,
                  label: "",
                  categoryType: null,
                });
                setOpen(false);
              }
              }>없음</CommandItem>
              {search && Object.keys(ETC_CATEGORY).map((key: keyof typeof ETC_CATEGORY) => {
                const data = ETC_CATEGORY[key];

                return (
                  <CommandItem key={data.category} value={data.category} keywords={[...data.keywords, key]} onSelect={(currentValue) => {
                    setSelected({
                      value: currentValue,
                      label: key,
                      categoryType: "ETC",
                    })
                    setOpen(false);
                  }}>
                    <img src={`https://ssl.pstatic.net/static/nng/glive-center/resource/p/${data.icon}`} className="mr-2 h-4 w-4 object-cover" />
                    <span>{key}</span>
                  </CommandItem>
                )
              })}
              {categories.map((category) => (
                <CommandItem
                  key={category.categoryId}
                  value={category.categoryId}
                  keywords={[category.categoryValue]}
                  onSelect={(currentValue) => {
                    setSelected({
                      value: currentValue,
                      label: category.categoryValue,
                      categoryType: "GAME",
                    });
                    setOpen(false);
                  }}
                >
                  <img src={category.posterImageUrl} className="mr-2 h-4 w-4 object-cover" />
                  <span>{category.categoryValue}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}