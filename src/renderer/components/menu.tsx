import { useTheme } from "@/components/theme-provider";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import MenuChatmode from "./menuChatmode";

export default function Menu() {
  const { theme, setTheme } = useTheme();

  const logOut = async () => {
    await window.electronApi.logOut();
    location.href =
      "https://nid.naver.com/nidlogin.login?url=https://chzzk.naver.com/";
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>설정</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>다크 모드</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarCheckboxItem
                checked={theme === "system"}
                onClick={() => setTheme("system")}
              >
                시스템 설정
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={theme === "light"}
                onClick={() => setTheme("light")}
              >
                라이트 모드
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={theme === "dark"}
                onClick={() => setTheme("dark")}
              >
                다크 모드
              </MenubarCheckboxItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem onClick={logOut}>로그아웃</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenuChatmode />
    </Menubar>
  );
}
