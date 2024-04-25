import {clsx} from "clsx";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";
import useLiveDetail from "../electronApi/useLiveDetail";
import { useEffect, useRef, useState } from "react";
import {format, intervalToDuration, parse} from "date-fns";

export default function OnAir({className, style}: {className?: string, style?: React.CSSProperties}) {
  const {data} = useLiveDetail();
  const [time, setTime] = useState("");
  const intervalId = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (data?.content?.status !== "CLOSE" && data?.content?.openDate) {
      if (intervalId.current) clearInterval(intervalId.current);
      intervalId.current = setInterval(() => {
        const duration = intervalToDuration({
          start: parse(data.content.openDate, "yyyy-MM-dd HH:mm:ss", new Date()),
          end: new Date(),
        });
        setTime(format(new Date(0, 0, 0, duration.hours || 0, duration.minutes || 0, duration.seconds || 0), "HH:mm:ss"));
      }, 1000);
    } else if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
      setTime("");
    }
  }, [data]);

  return (
    time &&
    <Badge variant="default" className={clsx("text-lg", className)} style={style}><Radio /><span className="ml-1">{time}</span></Badge>
  );
}
