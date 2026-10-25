import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette, Shadow } from '@/constants/Colors';
import {
  TransferCode,
  formatCode,
  issueTransferCode,
  loadCurrentTransferCode,
  transferErrorMessage,
} from '@/helper/transfer';

function CodeRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.codeRow}>
      <Text style={styles.codeLabel}>{label}</Text>
      <Text style={styles.codeValue} selectable>
        {formatCode(value)}
      </Text>
    </View>
  );
}

export default function IssueTransferCode() {
  const [code, setCode] = useState<TransferCode | null>(null);
  const [checking, setChecking] = useState(true);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    loadCurrentTransferCode().then((stored) => {
      setCode(stored);
      setChecking(false);
    });
  }, []);

  const issue = async () => {
    setIssuing(true);
    try {
      setCode(await issueTransferCode());
    } catch (e) {
      console.error('Failed to issue transfer code:', e);
      Alert.alert('エラー', transferErrorMessage(e));
    } finally {
      setIssuing(false);
    }
  };

  const confirmReissue = () =>
    Alert.alert(
      '再発行しますか？',
      'パスワードが新しくなり、今のコードは使えなくなります。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '再発行', style: 'destructive', onPress: issue },
      ],
    );

  const copy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(
      `ID: ${formatCode(code.id)}\nパスワード: ${formatCode(code.password)}`,
    );
    Alert.alert('コピーしました');
  };

  if (checking) return <View style={styles.container} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>
        機種変更やアプリの再インストールのときに、新しい端末で引き継ぎコードを入力すると、記録をそのまま引き継げます。
      </Text>

      {code && (
        <View style={styles.card}>
          <CodeRow label="ID" value={code.id} />
          <View style={styles.divider} />
          <CodeRow label="パスワード" value={code.password} />
          <Pressable onPress={copy} hitSlop={8} style={styles.copyButton}>
            {({ pressed }) => (
              <Text style={[styles.copyText, pressed && styles.copyPressed]}>
                コピー
              </Text>
            )}
          </Pressable>
        </View>
      )}

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          ・スクリーンショットを撮るか、メモして大切に保管してください。
        </Text>
        <Text style={styles.noticeText}>
          ・コードを知っている人は、誰でもあなたの記録にアクセスできます。他人に教えないでください。
        </Text>
      </View>

      {code ? (
        <PrimaryButton
          label="再発行する"
          variant="secondary"
          onPress={confirmReissue}
          loading={issuing}
        />
      ) : (
        <PrimaryButton
          label="引き継ぎコードを発行"
          onPress={issue}
          loading={issuing}
        />
      )}
    </ScrollView>
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
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...Shadow.card,
  },
  codeRow: {
    paddingVertical: 12,
    gap: 4,
  },
  codeLabel: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  codeValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    color: Palette.text,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: Palette.divider,
  },
  copyButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.primary,
  },
  copyPressed: {
    color: Palette.primaryPressed,
  },
  notice: {
    gap: 6,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: Palette.textMuted,
  },
});
