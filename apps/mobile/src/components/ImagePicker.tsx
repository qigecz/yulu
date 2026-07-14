import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, fontSize, radius } from '@yulu/ui';

/**
 * Multi-image picker. Holds local file URIs; the parent decides whether to
 * upload them (real mode) or use them as-is for preview (mock mode).
 */
export function ImagePickerInput({
  uris,
  onChange,
  max = 9,
}: {
  uris: string[];
  onChange: (uris: string[]) => void;
  max?: number;
}) {
  const [requesting, setRequesting] = React.useState(false);

  const pick = async () => {
    setRequesting(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要相册权限', '请在系统设置中允许访问相册后再试。');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: max - uris.length,
        quality: 0.8,
      });
      if (result.canceled) return;
      const picked = result.assets.map((a) => a.uri);
      onChange([...uris, ...picked].slice(0, max));
    } finally {
      setRequesting(false);
    }
  };

  const remove = (uri: string) => onChange(uris.filter((u) => u !== uri));

  return (
    <View>
      <View style={styles.grid}>
        {uris.map((uri) => (
          <View key={uri} style={styles.thumb}>
            <Image source={{ uri }} style={styles.thumbImg} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => remove(uri)}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {uris.length < max && (
          <TouchableOpacity style={styles.addBox} onPress={pick} activeOpacity={0.7}>
            {requesting ? (
              <ActivityIndicator color={colors.muted} />
            ) : (
              <>
                <Text style={styles.addIcon}>＋</Text>
                <Text style={styles.addText}>添加图片</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.hint}>最多 {max} 张 · 单张 ≤ 8MB</Text>
    </View>
  );
}

const THUMB = 96;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: { width: THUMB, height: THUMB, borderRadius: radius.md, overflow: 'hidden' },
  thumbImg: { width: THUMB, height: THUMB },
  removeBtn: {
    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  addBox: {
    width: THUMB, height: THUMB, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed',
    borderColor: colors.border, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  addIcon: { fontSize: 26, color: colors.muted },
  addText: { fontSize: fontSize.tiny, color: colors.muted, marginTop: 2 },
  hint: { fontSize: fontSize.tiny, color: colors.muted, marginTop: 6 },
});
