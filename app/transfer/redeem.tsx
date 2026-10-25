import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/Colors';
import {
  ID_LENGTH,
  PASSWORD_LENGTH,
  normalizeCode,
  redeemTransferCode,
  transferErrorMessage,
} from '@/helper/transfer';

function CodeInput({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Palette.textDisabled}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
      />
    </View>
  );
}

/**
 * 引き継ぎコードの入力画面。
 * コードでログインし直すと uid が引き継ぎ元のものに変わり、各画面は useUserId 経由で
 * 自動的に引き継ぎ元の記録を表示する。
 */
export default function RedeemTransferCode() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 区切りや小文字を取り除いた桁数がそろったら「引き継ぐ」を押せるようにする
  const isComplete =
    normalizeCode(id).length === ID_LENGTH &&
    normalizeCode(password).length === PASSWORD_LENGTH;

  const redeem = async () => {
    setSubmitting(true);
    try {
      await redeemTransferCode(id, password);
      Alert.alert('引き継ぎが完了しました', '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      console.error('Failed to redeem transfer code:', e);
      Alert.alert('エラー', transferErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  // 今の匿名アカウントの記録は見られなくなるため、実行前に確認する
  const confirm = () =>
    Alert.alert(
      '引き継ぎますか？',
      'この端末の今の記録は表示されなくなり、引き継ぎ元の記録に置き換わります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '引き継ぐ', style: 'destructive', onPress: redeem },
      ],
    );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.description}>
          以前の端末で発行した引き継ぎコードを入力してください。ハイフンは省略できます。
        </Text>
        <CodeInput
          label="ID"
          value={id}
          onChangeText={setId}
          placeholder="XXXX-XXXX-XXXX"
        />
        <CodeInput
          label="パスワード"
          value={password}
          onChangeText={setPassword}
          placeholder="XXXX-XXXX-XXXX-XXXX"
        />
        <PrimaryButton
          label="引き継ぐ"
          onPress={confirm}
          disabled={!isComplete}
          loading={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Palette.text,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.textMuted,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    fontSize: 17,
    letterSpacing: 1,
    color: Palette.text,
  },
});
