import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { SettingProvider } from "./components/settingProvider";
import useStreamingInfo from "./electronApi/useStreamingInfo";
import { useCallback, useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import PQueue from "p-queue";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Moon, Sun } from "lucide-react";
import clsx from "clsx";

export default function ChatApp() {
  const theme = useTheme();
  const { data, isLoading } = useStreamingInfo();
  const chatRef = useRef(null);
  const chatWebviewLoading = useRef(true);
  const cssKey = useRef("");
  const [previewBackground, setPreviewBackground] = useState(
    theme.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme.theme
  );

  const [cssObj, setCssObj] = useState({
    nickname: true,
    icon: true,
    donation: true,
    backgroundColor: "#000000",
    backgroundOpacity: 0.9,
    textColor: "#ffffff",
    textOpacity: 1,
    textShadow: false,
    textStroke: false,
    fontSize: 24,
    fontWeightBold: false,
    importNanumGothic: false,
  });

  const queue = useRef(new PQueue({ concurrency: 1 }));

  const hexToRGB = (hex: string) =>
    `${parseInt(hex.slice(1, 3), 16)},${parseInt(
      hex.slice(3, 5),
      16
    )},${parseInt(hex.slice(5, 7), 16)}`;

  const getCss = useCallback(() => {
    let css = "";
    const {
      nickname,
      icon,
      donation,
      backgroundColor,
      backgroundOpacity,
      textColor,
      textOpacity,
      textShadow,
      textStroke,
      fontSize,
      fontWeightBold,
      importNanumGothic,
    } = cssObj;

    if (importNanumGothic) {
      css += `@import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&family=Noto+Sans+KR&display=swap');`;
      css += `[class^="live_overlay_chatting"] [class^="live_overlay_item"] [class^="live_chatting_message_container"] [class^="live_chatting_message_wrapper"]{font-family:"Nanum Gothic", sans-serif}`;
    }

    if (!nickname && !icon) {
      css += `[class^="live_chatting_message_container"]:not(:has(br)) [class^="live_chatting_username_container"]{display:none}`;
    } else {
      if (!nickname) {
        css += `[class^="live_chatting_message_container"]:not(:has(br)) [class^="live_chatting_username_nickname"]{display:none}`;
        css += `[class^="live_chatting_message_container"] [class^="live_chatting_message_wrapper"] [class^="live_chatting_username_container"] [class^="live_chatting_username_wrapper"]{margin-right:0}`;
      }
      if (!icon) {
        css += `[class^="live_chatting_message_container"]:not(:has(br)) [class^="live_chatting_username_wrapper"]{display:none}`;
      }
    }

    if (!donation) {
      css += `[class^="live_overlay_chatting"] [class^="live_overlay_item"]:has(br){display:none}`;
    }

    css += `[class^="live_overlay_chatting"] [class*="live_overlay_message"]{background-color:rgb(${hexToRGB(
      backgroundColor
    )},${backgroundOpacity})}`;
    css += `[class^="live_overlay_chatting"] [class^="live_chatting_message_container"] [class^="live_chatting_message_wrapper"] [class^="live_chatting_message_text"]{color:rgb(${hexToRGB(
      textColor
    )});opacity:${textOpacity}}`;
    css += `[class^="live_chatting_message_container"] [class^="live_chatting_username_nickname"]{opacity:${textOpacity}}`;

    if (textShadow) {
      css += `[class^="live_chatting_message_container"]{text-shadow: 1px 1px 2px rgb(0,0,0,0.8)}`;
    }
    if (textStroke) {
      css += `[class^="live_chatting_message_container"]{text-shadow: -1px -1px 0 rgba(0,0,0,.7),-1px 1px 0 rgba(0,0,0,.7),1px -1px 0 rgba(0,0,0,.7),1px 1px 0 rgba(0,0,0,.7),0 0 1px rgba(0,0,0,.7),0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000,0 0 3px #000}`;
    }
    if (fontWeightBold) {
      css += `[class^="live_overlay_chatting"] [class^="live_overlay_item"] [class^="live_chatting_message_container"] [class^="live_chatting_message_wrapper"]{font-weight:bold}`;
      css += `[class^="live_chatting_message_container"] [class^="live_chatting_username_nickname"]{font-weight:bold}`;
    }
    css += `[class^="live_overlay_chatting"] [class^="live_overlay_item"] [class^="live_chatting_message_container"] [class^="live_chatting_message_wrapper"]{font-size:${fontSize}px;line-height:1.333}`;

    return css;
  }, [cssObj]);

  const changeChatStyle = useCallback(async () => {
    await queue.current.add(async () => {
      const css = getCss();

      const key = await chatRef.current.insertCSS(css);
      await chatRef.current.removeInsertedCSS(cssKey.current);
      cssKey.current = key;
    });
  }, [getCss]);

  const clipboardCss = () => {
    const css = getCss();
    window.electronApi.clipboardWriteText(css);
    toast.success("css 복사 완료");
  };

  useEffect(() => {
    if (chatWebviewLoading.current) return;
    changeChatStyle();
  }, [cssObj, changeChatStyle]);

  useEffect(() => {
    if (isLoading) return;
    chatRef.current.addEventListener("dom-ready", () => {
      chatWebviewLoading.current = false;
      changeChatStyle();

      if (process.env.NODE_ENV === "development") {
        chatRef.current.openDevTools();
      }
    });
  }, [isLoading, changeChatStyle]);

  return (
    !isLoading && (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <SettingProvider>
          <div className="flex h-lvh w-lvw">
            <webview
              ref={chatRef}
              className={clsx("w-[520px]", {"bg-white": previewBackground === "light"}, {"bg-black": previewBackground === "dark"})}
              src={`https://chzzk.naver.com/chat/${data?.content?.chatSourceHash}`}
            />
            <div className="flex-1 py-2 px-2">
              <div className="flex flex-col gap-2">
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  미리보기 배경색
                  <Button variant="outline" size="icon" onClick={() => {setPreviewBackground(previewBackground === "light" ? "dark" : "light")}}>
                    <Sun className={clsx("h-[1.2rem] w-[1.2rem] transition-all", {"rotate-0 scale-100": previewBackground === "light"}, {"-rotate-90 scale-0": previewBackground === "dark"})} />
                    <Moon className={clsx("absolute h-[1.2rem] w-[1.2rem] transition-all", {"rotate-90 scale-0": previewBackground === "light"}, {"rotate-0 scale-100": previewBackground === "dark"})} />
                  </Button>
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>닉네임 표시</span>
                  <Switch
                    checked={cssObj.nickname}
                    onCheckedChange={(checked) =>
                      setCssObj({ ...cssObj, nickname: checked })
                    }
                  />
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>아이콘 표시</span>
                  <Switch
                    checked={cssObj.icon}
                    onCheckedChange={(checked) =>
                      setCssObj({ ...cssObj, icon: checked })
                    }
                  />
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>후원 표시</span>
                  <Switch
                    checked={cssObj.donation}
                    onCheckedChange={(checked) =>
                      setCssObj({ ...cssObj, donation: checked })
                    }
                  />
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>글자 크기</span>
                  <Input
                    type="number"
                    className="w-16"
                    value={cssObj.fontSize}
                    onChange={(e) =>
                      setCssObj({
                        ...cssObj,
                        fontSize: Number(e.currentTarget.value),
                      })
                    }
                  />
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>메시지 배경색</span>
                  <input
                    type="color"
                    value={cssObj.backgroundColor}
                    onChange={(e) =>
                      setCssObj({
                        ...cssObj,
                        backgroundColor: e.currentTarget.value,
                      })
                    }
                  />
                </label>
                <label className="flex gap-2 flex-col select-none cursor-pointer">
                  <span>메시지 배경 투명도 {cssObj.backgroundOpacity}</span>
                  <div className="pr-2">
                    <Slider
                      defaultValue={[0.9]}
                      value={[cssObj.backgroundOpacity]}
                      onValueChange={([v]) =>
                        setCssObj({ ...cssObj, backgroundOpacity: v })
                      }
                      max={1}
                      step={0.1}
                    />
                  </div>
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>메시지 글자색</span>
                  <input
                    type="color"
                    value={cssObj.textColor}
                    onChange={(e) =>
                      setCssObj({ ...cssObj, textColor: e.currentTarget.value })
                    }
                  />
                </label>
                <label className="flex gap-2 flex-col select-none cursor-pointer">
                  <span>메시지 글자 투명도 {cssObj.textOpacity}</span>
                  <div className="pr-2">
                    <Slider
                      defaultValue={[0.9]}
                      value={[cssObj.textOpacity]}
                      onValueChange={([v]) =>
                        setCssObj({ ...cssObj, textOpacity: v })
                      }
                      max={1}
                      step={0.1}
                    />
                  </div>
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>나눔고딕 웹폰트</span>
                  <Switch
                    checked={cssObj.importNanumGothic}
                    onCheckedChange={(checked) =>
                      setCssObj({ ...cssObj, importNanumGothic: checked })
                    }
                  />
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>글자 두껍게</span>
                  <Switch
                    checked={cssObj.fontWeightBold}
                    onCheckedChange={(checked) =>
                      setCssObj({ ...cssObj, fontWeightBold: checked })
                    }
                  />
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>글자 그림자</span>
                  <Switch
                    checked={cssObj.textShadow}
                    onCheckedChange={(checked) =>
                      setCssObj({ ...cssObj, textShadow: checked })
                    }
                  />
                </label>
                <label className="flex gap-2 select-none cursor-pointer items-center">
                  <span>글자 테두리</span>
                  <Switch
                    checked={cssObj.textStroke}
                    onCheckedChange={(checked) =>
                      setCssObj({ ...cssObj, textStroke: checked })
                    }
                  />
                </label>
                <Button onClick={clipboardCss}>css 복사</Button>
              </div>
            </div>
          </div>
          <Toaster richColors />
        </SettingProvider>
      </ThemeProvider>
    )
  );
}
