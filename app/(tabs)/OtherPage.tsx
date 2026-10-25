import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import { Href, Link } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette, Shadow } from '@/constants/Colors';

/** 見出し付きのグループ（中の行をカードにまとめる） */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

type RowProps = {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  /** 右側に表示する値（指定時は遷移しない行になる） */
  value?: string;
  /** 押したときの遷移先 */
  href?: Href;
  /** グループの最後の行（下の区切り線を出さない） */
  isLast?: boolean;
};

/** グループ内の1行。href があれば押せる行、value があれば値を表示する行になる */
function Row({ icon, label, value, href, isLast = false }: RowProps) {
  const content = (pressed: boolean) => (
    <View
      style={[
        styles.row,
        !isLast && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.iconCircle}>
        <FontAwesome name={icon} size={14} color={Palette.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value !== undefined ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : (
        <FontAwesome
          name="angle-right"
          size={18}
          color={Palette.iconInactive}
        />
      )}
    </View>
  );

  if (!href) return content(false);
  return (
    <Link href={href} asChild>
      <Pressable>{({ pressed }) => content(pressed)}</Pressable>
    </Link>
  );
}

/** Other タブ。データの引き継ぎとアプリ情報への入り口 */
export default function OtherPage() {
  // app.json の expo.version
  const version = Constants.expoConfig?.version ?? '-';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Other</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="データの引き継ぎ">
          <Row icon="key" label="引き継ぎコードを発行" href="/transfer/issue" />
          <Row
            icon="download"
            label="引き継ぎコードを入力"
            href="/transfer/redeem"
            isLast
          />
        </Section>
        <Section title="アプリについて">
          <Row icon="info" label="バージョン" value={version} />
          <Row
            icon="shield"
            label="プライバシーポリシー"
            href="/privacy-policy"
            isLast
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  header: {
    paddingTop: 6,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: Palette.text,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 22,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Palette.textMuted,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 14,
    overflow: 'hidden',
    ...Shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Palette.surface,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.divider,
  },
  rowPressed: {
    backgroundColor: Palette.surfaceMuted,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: Palette.text,
  },
  rowValue: {
    fontSize: 14,
    color: Palette.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
