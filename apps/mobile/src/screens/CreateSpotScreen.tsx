import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, radius } from '@yulu/ui';
import { useCreateSpot } from '../hooks/queries';
import { ApiError } from '../api/client';
import { uploadsApi } from '../api/endpoints';
import { USE_MOCK } from '../config';
import { Field, TextField, MultilineField, TagInput, SubmitButton, Header } from '../components/FormControls';
import { ImagePickerInput } from '../components/ImagePicker';

// Common quick-pick options for faster entry.
const FISH_OPTIONS = ['鲈鱼', '鲫鱼', '翘嘴', '鳜鱼', '鲤鱼', '草鱼'];
const METHOD_OPTIONS = ['路亚', '台钓', '湖钓', '溪流'];
const BOTTOM_OPTIONS = ['岩石底', '沙底', '水草', '碎石', '暗礁'];

export function CreateSpotScreen() {
  const createSpot = useCreateSpot();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('29.6');
  const [longitude, setLongitude] = useState('118.9');
  const [fishSpecies, setFishSpecies] = useState<string[]>([]);
  const [fishingMethod, setFishingMethod] = useState('');
  const [waterDepth, setWaterDepth] = useState('');
  const [bottomType, setBottomType] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError('请填写钓点名称');
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) return setError('纬度无效（-90 ~ 90）');
    if (Number.isNaN(lng) || lng < -180 || lng > 180) return setError('经度无效（-180 ~ 180）');

    // Real mode: upload images first. Mock mode: keep local URIs for preview.
    let imageUrls: string[] = images;
    if (!USE_MOCK && images.length > 0) {
      try {
        imageUrls = await uploadsApi.upload(images);
      } catch (e) {
        setError(e instanceof ApiError ? `图片上传失败：${e.message}` : '图片上传失败');
        return;
      }
    }

    try {
      await createSpot.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        latitude: lat,
        longitude: lng,
        fishSpecies,
        fishingMethod: fishingMethod || undefined,
        waterDepth: waterDepth || undefined,
        bottomType: bottomType || undefined,
        tags,
        images: imageUrls,
      });
      Alert.alert('已分享', '钓点已发布，感谢你的贡献！', [{ text: '好的' }]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '发布失败，请重试');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Header title="分享钓点" subtitle="标注一个真实作钓记录，帮后来者少走弯路" />

      <Field label="钓点名称" hint="必填">
        <TextField value={name} onChangeText={setName} placeholder="如：千岛湖 · 碧溪湾" maxLength={100} />
      </Field>

      <Field label="简介">
        <MultilineField value={description} onChangeText={setDescription} placeholder="水深、水流、最佳时段…" maxLength={500} />
      </Field>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field label="纬度" hint="必填">
            <TextField value={latitude} onChangeText={setLatitude} placeholder="29.6" keyboardType="numeric" />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="经度" hint="必填">
            <TextField value={longitude} onChangeText={setLongitude} placeholder="118.9" keyboardType="numeric" />
          </Field>
        </View>
      </View>

      <Field label="鱼种">
        <OptionPicker options={FISH_OPTIONS} selected={fishSpecies} onToggle={(v) => toggleInArray(setFishSpecies, fishSpecies, v)} />
        {fishSpecies.length === 0 && <Text style={styles.subHint}>点选常见鱼种，或用下方标签自定义</Text>}
        <View style={{ height: 8 }} />
        <TagInput values={fishSpecies} onChange={setFishSpecies} placeholder="自定义鱼种后点 +" />
      </Field>

      <Field label="钓法">
        <OptionPicker options={METHOD_OPTIONS} selected={fishingMethod ? [fishingMethod] : []} onToggle={(v) => setFishingMethod(fishingMethod === v ? '' : v)} single />
      </Field>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field label="水深">
            <TextField value={waterDepth} onChangeText={setWaterDepth} placeholder="如 4-6m" />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="底质">
            <OptionPicker options={BOTTOM_OPTIONS} selected={bottomType ? [bottomType] : []} onToggle={(v) => setBottomType(bottomType === v ? '' : v)} single compact />
          </Field>
        </View>
      </View>

      <Field label="标签">
        <TagInput values={tags} onChange={setTags} placeholder="如 深水、缓流" />
      </Field>

      <Field label="图片">
        <ImagePickerInput uris={images} onChange={setImages} />
      </Field>

      {error && <Text style={styles.error}>{error}</Text>}

      <SubmitButton title="发布钓点" onPress={submit} loading={createSpot.isPending} />
    </ScrollView>
  );
}

function toggleInArray(setter: React.Dispatch<React.SetStateAction<string[]>>, arr: string[], v: string) {
  setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
}

function OptionPicker({
  options, selected, onToggle, single, compact,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  single?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={[styles.optionRow, compact && { flexWrap: 'wrap' }]}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <React.Fragment key={opt}>
            <TouchableOpacity
              style={[styles.option, active && styles.optionActive, compact && styles.optionCompact]}
              onPress={() => onToggle(opt)}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
            </TouchableOpacity>
            <View style={{ width: 6 }} />
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.screenPadding },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  option: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  optionCompact: { paddingVertical: 11, flex: 0 },
  optionActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { fontSize: fontSize.meta, color: colors.fg },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  subHint: { fontSize: fontSize.tiny, color: colors.muted, marginTop: 6 },
  error: { fontSize: fontSize.meta, color: colors.danger, marginBottom: 10 },
});
