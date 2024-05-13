import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import useUserIdHash from "../electronApi/useUserIdHash";
import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSetting } from "./settingProvider";
import OnAir from "./onair";

export default function Webviews() {
  const chatRef = useRef(null);
  const chatWebviewLoading = useRef(true);
  const {
    data: {
      content: { userIdHash },
    },
  } = useUserIdHash();
  const {theme} = useTheme();
  const {setting, setSetting} = useSetting();
  const cssKey = useRef("");
  const changeZoom = async (zoomIn: boolean) => {
    if (zoomIn) {
      setZoom(setting.chatFontSize + 2);
    } else if (setting.chatFontSize > 2) {
      setZoom(setting.chatFontSize - 2);
    }
  };
  const setZoom = useCallback(async (size: number = setting.chatFontSize) => {
    setSetting({chatFontSize: size});

    if (cssKey.current) await chatRef.current.removeInsertedCSS(cssKey.current);
    cssKey.current = await chatRef.current.insertCSS(
      `button[class^=live_chatting_message_wrapper] {line-height: 1.42 !important; font-size: ${size}px;} span[class^=live_chatting_username_container] {display: inline-flex;align-items:center;} span[class^=live_chatting_username_nickname] {line-height: 1.42 !important;}`
    );
  }, [setSetting, setting.chatFontSize]);
  const changeChatColor = useCallback(() => {
    let themeResult = "";
    switch (theme) {
      case "dark":
        themeResult = "dark";
        break;
      case "light":
        themeResult = "light";
        break;
      case "system":
        themeResult = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        break;
    }
    const script = `document.documentElement.classList.${themeResult === "dark" ? "add" : "remove"}("theme_dark")`;

    chatRef.current.executeJavaScript(script);
  }, [theme]);

  useEffect(() => {
    if (chatWebviewLoading.current) return;
    changeChatColor();
  }, [theme, changeChatColor]);

  useEffect(() => {
    chatRef.current.addEventListener("dom-ready", () => {
      chatWebviewLoading.current = false;
      changeChatColor();
      setZoom();
    });
  }, [changeChatColor, setZoom]);

  return (
    <ResizablePanelGroup direction="horizontal" className="flex flex-1" autoSaveId="webviewPanelGroup">
      <ResizablePanel className="min-w-[353px] relative">
        <webview
          ref={chatRef}
          src={`https://chzzk.naver.com/live/${userIdHash}/chat`}
          className="border-0 h-full"
        ></webview>
        <div className="absolute top-0 left-1">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              changeZoom(false);
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              changeZoom(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        className="min-w-[var(--widthpx)] relative overflow-hidden"
        style={
          {
            "--widthpx": setting.remoteCollapse ? "340px" : "560px",
            "--width": setting.remoteCollapse ? "340" : "560",
          } as CSSProperties
        }
      >
        <webview
          src={`https://studio.chzzk.naver.com/${userIdHash}/remotecontrol`}
          className="border-0 h-full"
          style={{ marginRight: setting.remoteCollapse ? "-220px" : "0" }}
        ></webview>
        <div className="absolute top-0 h-10 flex items-center" style={{right: setting.remoteCollapse ? "48px" : "268px"}}>
          <OnAir />
        </div>
        <Button
          size="icon"
          className="absolute bottom-0"
          style={{ right: setting.remoteCollapse ? "0" : "220px" }}
          onClick={() => {
            setSetting({remoteCollapse: !setting.remoteCollapse});
          }}
        >
          {setting.remoteCollapse ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
