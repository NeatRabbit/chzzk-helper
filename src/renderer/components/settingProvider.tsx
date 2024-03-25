import { createContext, useContext, useState } from "react";

interface Setting {
  chatFontSize: number,
  remoteCollapse: boolean,
}

interface SettingProviderProps {
  children: React.ReactNode
}

interface SettingProviderState {
  setting: Setting
  setSetting: (setting: Partial<Setting>) => void
}

const initialState: SettingProviderState = {
  setting: {
    chatFontSize: 14,
    remoteCollapse: false,
  },
  setSetting: () => null,
}

const SettingProviderContext = createContext<SettingProviderState>(initialState)

export function SettingProvider({
  children,
}: SettingProviderProps) {
  const [setting, setSetting] = useState<Setting>(() => (JSON.parse(localStorage.getItem("setting")) || initialState.setting));
  const value: SettingProviderState = {
    setting,
    setSetting: (newSetting) => {
      const newValue = {
        ...setting,
        ...newSetting,
      };

      localStorage.setItem("setting", JSON.stringify(newValue));
      setSetting(newValue);
    },
  }

  return <SettingProviderContext.Provider value={value}>{children}</SettingProviderContext.Provider>
}

export const useSetting = () => {
  const context = useContext(SettingProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}