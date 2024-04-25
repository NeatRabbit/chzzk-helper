import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { clsx } from "clsx";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useLiveSetting from "../electronApi/useLiveSetting";
import { TagResponse } from "@/main/chzzkApi";

export default function TagSelector({
  className,
  onAddTag,
}: {
  className?: string;
  onAddTag?: (tag: string) => void;
}) {
  const { useGetTag } = useLiveSetting();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState([] as TagResponse["content"]["keywords"]);

  const { data: tagData } = useGetTag(search);

  useEffect(() => {
    console.log(tagData);
    setTags(tagData?.content?.keywords || []);
  }, [tagData]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={clsx("w-[200px] justify-between", className)}
        >
          <span className="text-ellipsis text-nowrap overflow-hidden">
            태그 추가
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
            }
          }}
        >
          <CommandInput
            placeholder="태그 검색 (Ctrl+Enter시에 태그 추가)"
            value={search}
            maxLength={15}
            onValueChange={setSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                onAddTag(search);
              }
            }}
          />
          <CommandList>
            <CommandEmpty>검색결과가 없습니다.</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem
                  key={tag}
                  value={tag}
                  onSelect={(currentValue) => {
                    onAddTag(currentValue);
                  }}
                >
                  <span>{tag}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
