import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persisted app settings (survives restarts via AsyncStorage), mirroring the
 * prototype settings page (prototypes/screens/ios-settings.html): three
 * notification toggles plus the Wi-Fi-only download preference. Push
 * registration in usePushNotifications is gated on the notify flags.
 */
interface SettingsState {
  /** 出鱼高峰提醒：钓点进入出鱼窗口时推送。 */
  notifyFishWindow: boolean;
  /** 关注的新动态：关注的钓友发布坑点、路线时提醒。 */
  notifyFollowUpdates: boolean;
  /** 系统通知：公告与运营消息。 */
  notifySystem: boolean;
  /** 仅 Wi-Fi 下载离线内容，避免消耗蜂窝流量。 */
  wifiOnlyDownloads: boolean;
  setNotifyFishWindow: (v: boolean) => void;
  setNotifyFollowUpdates: (v: boolean) => void;
  setNotifySystem: (v: boolean) => void;
  setWifiOnlyDownloads: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifyFishWindow: true,
      notifyFollowUpdates: true,
      notifySystem: false,
      wifiOnlyDownloads: true,
      setNotifyFishWindow: (notifyFishWindow) => set({ notifyFishWindow }),
      setNotifyFollowUpdates: (notifyFollowUpdates) => set({ notifyFollowUpdates }),
      setNotifySystem: (notifySystem) => set({ notifySystem }),
      setWifiOnlyDownloads: (wifiOnlyDownloads) => set({ wifiOnlyDownloads }),
    }),
    {
      name: 'yulu-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
