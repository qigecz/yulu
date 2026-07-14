import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, radius } from '@yulu/ui';

/** Labeled form field wrapper. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}

const inputBase = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: fontSize.body,
  color: colors.fg,
};

export function TextField(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} style={[inputBase, props.style]} placeholderTextColor={colors.muted} />;
}

export function MultilineField(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[inputBase, { minHeight: 96, textAlignVertical: 'top' }, props.style]}
      placeholderTextColor={colors.muted}
      multiline
    />
  );
}

/**
 * Chip-style tag input: type a value, press + to add; tap a chip to remove.
 */
export function TagInput({
  values,
  onChange,
  placeholder = '输入后点 + 添加',
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };

  return (
    <View>
      <View style={styles.tagInputRow}>
        <TextInput
          style={[inputBase, { flex: 1, paddingVertical: 10 }]}
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={add}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {values.length > 0 && (
        <View style={styles.chipRow}>
          {values.map((v) => (
            <TouchableOpacity key={v} style={styles.chip} onPress={() => onChange(values.filter((x) => x !== v))}>
              <Text style={styles.chipText}>{v} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

/** Screen header (serif title + optional subtitle) shared by overlay screens. */
export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={headerStyles.header}>
      <Text style={headerStyles.title}>{title}</Text>
      {subtitle && <Text style={headerStyles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  header: { paddingTop: 18, paddingBottom: 16 },
  title: { fontFamily: 'Georgia', fontSize: fontSize.h1, letterSpacing: -0.02, color: colors.fg },
  subtitle: { fontSize: fontSize.meta, color: colors.muted, marginTop: 4 },
});

/** Primary submit button used by forms. */
export function SubmitButton({
  title,
  onPress,
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.submit, (loading || disabled) && styles.submitDisabled]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.submitText}>{loading ? '提交中…' : title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  label: { fontSize: fontSize.tiny, color: colors.muted, letterSpacing: 0.06, textTransform: 'uppercase' },
  hint: { fontSize: fontSize.tiny, color: colors.muted, marginLeft: 6, opacity: 0.7 },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: {
    width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
    backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accent,
  },
  chipText: { fontSize: fontSize.meta, color: colors.accent, fontWeight: '600' },
  submit: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: fontSize.body, fontWeight: '600' },
});
