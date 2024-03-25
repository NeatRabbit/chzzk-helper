import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Webviews from "./components/webviews";
import ChatDonationSwitch from "./components/chatDonationSwitch";
import useUserIdHash from "./electronApi/useUserIdHash";
import VideoDonationSwitch from "./components/videoDonationSwitch";
import LiveSetting from "./components/liveSetting";
import Menu from "./components/menu";
// import DonationStatus from "./components/donationStatus";
import { SettingProvider } from "./components/settingProvider";

export default function App() {
  const { data, isLoading } = useUserIdHash();

  useEffect(() => {
    if (!isLoading && !data.content.loggedIn) {
      location.href =
        "https://nid.naver.com/nidlogin.login?url=https://chzzk.naver.com/";
    }
  }, [data, isLoading]);

  return (
    !isLoading && (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <SettingProvider>
          <div className="flex flex-col w-lvw h-lvh">
            <Menu />
            {/* <DonationStatus /> */}
            <div className="flex h-16 items-center gap-2 mx-3">
              <div className="flex flex-col gap-1 text-nowrap">
                <ChatDonationSwitch />
                <VideoDonationSwitch />
              </div>
              <LiveSetting />
            </div>
            <Webviews />
          </div>
          <Toaster />
        </SettingProvider>
      </ThemeProvider>
    )
  );
}
