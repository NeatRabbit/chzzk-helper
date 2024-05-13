import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function TagList({
  tags,
  onClickRemove,
}: {
  tags: string[];
  onClickRemove?: (tag: string) => void;
}) {
  return (
    <>
      {tags.map((tag) => (
        <Badge className="overflow-hidden" title={tag} key={tag}>
          <span className="overflow-hidden whitespace-nowrap text-ellipsis flex-1 break-all">
            {tag}
          </span>
          <button onClick={() => onClickRemove(tag)}>
            <X size="16" />
          </button>
        </Badge>
      ))}
    </>
  );
}
