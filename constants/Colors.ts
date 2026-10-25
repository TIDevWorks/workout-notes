const tintColorLight = '#1F78BA';
const tintColorDark = '#fff';

// デザイントークン
export const Palette = {
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3F5',
  text: '#14171C',
  textMuted: '#5B6270',
  textDisabled: '#C3C7CE',
  tagText: '#3D4450',
  iconInactive: '#8A919C',
  arrowDisabled: '#B5BAC2',
  primary: '#1F78BA',
  primaryPressed: '#1A6BA7',
  primarySoft: '#E8F2FA',
  dot: '#3A9DE0',
  sunday: '#C2473A',
  /** 削除など取り消せない操作 */
  danger: '#C2473A',
  saturday: '#2F6FB0',
  border: '#E6E8EB',
  divider: '#EEF0F2',
  dashed: '#D5D9DF',
  white: '#FFFFFF',
} as const;

// 影（iOS は shadow*、Android は elevation が使われる）
export const Shadow = {
  card: {
    shadowColor: Palette.text,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  primaryButton: {
    shadowColor: Palette.primary,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export default {
  light: {
    text: Palette.text,
    background: Palette.bg,
    tint: tintColorLight,
    tabIconDefault: Palette.iconInactive,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
