import React, { useState } from 'react';
import { Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors, spacing, fontSize } from '@yulu/ui';
import { useCreateFeed } from '../hooks/queries';
import { ApiError } from '../api/client';
import { uploadsApi } from '../api/endpoints';
import { USE_MOCK } from '../config';
import { Field, MultilineField, TextField, SubmitButton, Header } from '../components/FormControls';
import { ImagePickerInput } from '../components/ImagePicker';

export function ComposeFeedScreen() {
  const createFeed = useCreateFeed();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (content.trim().length < 5) return setError('说点什么吧（至少 5 个字）');

    // Real mode: upload first, then attach returned URLs. Mock mode: keep local URIs.
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
      await createFeed.mutateAsync({
        content: content.trim(),
        location: location.trim() || undefined,
        images: imageUrls,
      });
      Alert.alert('已发布', '动态已分享到社区。', [{ text: '好的' }]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : '发布失败，请重试');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Header title="发布动态" subtitle="和钓友分享你的作钓心得与收获" />

      <Field label="内容" hint={`${content.length}/500`}>
        <MultilineField
          value={content}
          onChangeText={setContent}
          placeholder="今天在哪钓鱼？用了什么饵？收获如何？"
          maxLength={500}
          style={{ minHeight: 140 }}
        />
      </Field>

      <Field label="位置">
        <TextField value={location} onChangeText={setLocation} placeholder="如：千岛湖 · 碧溪湾" maxLength={60} />
      </Field>

      <Field label="图片">
        <ImagePickerInput uris={images} onChange={setImages} />
      </Field>

      {error && <Text style={styles.error}>{error}</Text>}

      <SubmitButton title="发布动态" onPress={submit} loading={createFeed.isPending} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.screenPadding },
  error: { fontSize: fontSize.meta, color: colors.danger, marginBottom: 10 },
});
