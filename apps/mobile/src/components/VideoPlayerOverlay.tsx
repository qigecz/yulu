import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@yulu/ui';

interface Props {
  visible: boolean;
  title: string;
  sub: string;
  /** "mm:ss" 总时长；本地模拟播放进度。 */
  duration: string;
  /** 起播秒数（继续学习从上次进度恢复）。 */
  startSeconds?: number;
  /** 真实视频源（如教程 videoUrl）；有源且 expo-av 可用时走真实播放，否则模拟。 */
  url?: string;
  onClose: () => void;
}

const RATES = ['1.0x', '1.25x', '1.5x', '0.75x'];

function parseDuration(d: string): number {
  const [m, s] = d.split(':').map((n) => parseInt(n, 10) || 0);
  return m * 60 + s;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * 教程视频播放浮层（对照 ios-learn.html 的 player overlay）。
 * 有 url 时用 expo-av 真实播放（进度/倍速/暂停联动）；expo-av 动态导入——
 * 旧 dev client 没带该原生模块时静默回退到模拟播放（按倍速推进的进度条）。
 */
export function VideoPlayerOverlay({ visible, title, sub, duration, startSeconds = 0, url, onClose }: Props) {
  const total = Math.max(1, parseDuration(duration));
  const [cur, setCur] = useState(Math.min(startSeconds, total));
  const [playing, setPlaying] = useState(true);
  const [rateIdx, setRateIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // expo-av 按需加载（一次性）；加载失败（旧构建无原生模块）保持 null 走模拟。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [AV, setAV] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoRef = useRef<any>(null);
  const avFailed = useRef(false);
  useEffect(() => {
    if (!visible || !url || AV || avFailed.current) return;
    import('expo-av')
      .then(setAV)
      .catch(() => { avFailed.current = true; });
  }, [visible, url, AV]);
  const realVideo = !!(url && AV);
  const videoRate = parseFloat(RATES[rateIdx]);

  // 打开时恢复到指定进度并自动播放。
  useEffect(() => {
    if (visible) {
      setCur(Math.min(startSeconds, total));
      setPlaying(true);
      setRateIdx(0);
    }
  }, [visible, startSeconds, total]);

  // 模拟播放：按倍速每 500ms 推进，到片尾自动暂停（真实播放由 onPlaybackStatusUpdate 驱动）。
  useEffect(() => {
    if (!visible || !playing || realVideo) return;
    const rate = parseFloat(RATES[rateIdx]);
    const timer = setInterval(() => {
      setCur((c) => {
        const next = Math.min(total, c + rate / 2);
        if (next >= total) setPlaying(false);
        return next;
      });
    }, 500);
    return () => clearInterval(timer);
  }, [visible, playing, rateIdx, total, realVideo]);

  const progress = Math.min(1, cur / total);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* 顶栏：标题 + 关闭 */}
        <View style={styles.bar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.pSub}>{sub}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 播放舞台：真实视频或模拟画面 */}
        <View style={styles.stage}>
          <View style={styles.stageBadge}>
            <Text style={styles.stageBadgeText}>{realVideo ? '高清 · 在线播放' : '高清 · 1080P'}</Text>
          </View>
          {realVideo ? (
            <AV.Video
              source={{ uri: url }}
              rate={videoRate}
              volume={1.0}
              resizeMode="contain"
              shouldPlay={playing}
              useNativeControls={false}
              onLoad={(status: any) => {
                if (status.durationMillis) {
                  // 真实时长到位后跳到恢复进度。
                  void videoRef.current?.setPositionAsync(Math.min(startSeconds * 1000, status.durationMillis - 200));
                }
              }}
              onPlaybackStatusUpdate={(status: any) => {
                if (status.positionMillis != null) setCur(status.positionMillis / 1000);
                if (status.didJustFinish) setPlaying(false);
              }}
              ref={videoRef}
              style={styles.video}
            />
          ) : null}
          <TouchableOpacity style={styles.stateIcon} onPress={() => setPlaying((p) => !p)} activeOpacity={0.8}>
            <Ionicons name={playing ? 'pause' : 'play'} size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 控制区：进度 / 时间 / 操作 */}
        <View style={styles.ctl}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.times}>
            <Text style={styles.timeText}>{fmt(cur)}</Text>
            <Text style={styles.timeText}>{fmt(total)}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.pBtn} onPress={() => setPlaying((p) => !p)} activeOpacity={0.7}>
              <Ionicons name={playing ? 'pause' : 'play'} size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pBtn}
              onPress={() => setSaved((s) => !s)}
              activeOpacity={0.7}
            >
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? colors.accent : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pBtn}
              onPress={() => setDownloaded(true)}
              activeOpacity={0.7}
            >
              <Ionicons name={downloaded ? 'checkmark-circle' : 'cloud-download-outline'} size={22} color={downloaded ? colors.accent : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rateBtn} onPress={() => setRateIdx((i) => (i + 1) % RATES.length)} activeOpacity={0.7}>
              <Text style={styles.rateText}>{RATES[rateIdx]}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10, 14, 12, 0.97)', paddingTop: 20 },
  bar: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  pTitle: { fontSize: 14, fontWeight: '600', color: '#fff', lineHeight: 19 },
  pSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17, flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  stage: {
    flex: 1, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden',
    backgroundColor: '#1d3b33', alignItems: 'center', justifyContent: 'center',
  },
  video: { ...StyleSheet.absoluteFillObject },
  stageBadge: {
    position: 'absolute', left: 10, top: 10,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999,
  },
  stageBadgeText: { fontSize: 10, color: 'rgba(255,255,255,0.85)' },
  stateIcon: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctl: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, gap: 8 },
  track: { height: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: colors.accent },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  pBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rateBtn: {
    marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  rateText: { fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.85)' },
});
