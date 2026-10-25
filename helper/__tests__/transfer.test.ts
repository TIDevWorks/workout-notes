import { FirebaseError } from 'firebase/app';
import * as SecureStore from 'expo-secure-store';
import { auth } from '@/firebaseConfig';
import {
  ID_LENGTH,
  PASSWORD_LENGTH,
  TransferError,
  formatCode,
  loadCurrentTransferCode,
  normalizeCode,
  transferErrorMessage,
} from '@/helper/transfer';

// Firebase とネイティブモジュールには接続しない（テストするのは純粋な処理だけ）
jest.mock('@/firebaseConfig', () => ({ auth: { currentUser: null } }));
jest.mock('firebase/auth', () => ({}));
jest.mock('expo-crypto', () => ({ getRandomBytes: jest.fn() }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const mockedAuth = auth as unknown as { currentUser: { email: string } | null };
const getItemAsync = SecureStore.getItemAsync as jest.Mock;

describe('normalizeCode', () => {
  test('ハイフンを除いて大文字にする', () => {
    expect(normalizeCode('k7qf-2mxd-9pra')).toBe('K7QF2MXD9PRA');
  });

  test('空白や改行も除く（コピー＆ペースト対策）', () => {
    expect(normalizeCode(' K7QF 2MXD\n9PRA ')).toBe('K7QF2MXD9PRA');
  });

  test('全角の英数字（日本語入力のまま打った場合）を半角にする', () => {
    expect(normalizeCode('ｋ７ｑｆ－２ｍｘｄ－９ｐｒａ')).toBe('K7QF2MXD9PRA');
  });
});

describe('formatCode', () => {
  test('4 文字ごとにハイフンで区切る', () => {
    expect(formatCode('K7QF2MXD9PRA')).toBe('K7QF-2MXD-9PRA');
    expect(formatCode('ABCDEFGHJKLMNPQR')).toBe('ABCD-EFGH-JKLM-NPQR');
  });

  test('4 で割り切れない長さ・空文字', () => {
    expect(formatCode('ABCDE')).toBe('ABCD-E');
    expect(formatCode('')).toBe('');
  });

  test('表示用に区切ったコードを入力しても、元のコードに戻る', () => {
    for (const code of ['K7QF2MXD9PRA', 'ABCDEFGHJKLMNPQR']) {
      expect(normalizeCode(formatCode(code))).toBe(code);
    }
  });

  test('ID とパスワードの桁数', () => {
    expect(formatCode('A'.repeat(ID_LENGTH))).toHaveLength(ID_LENGTH + 2);
    expect(formatCode('A'.repeat(PASSWORD_LENGTH))).toHaveLength(
      PASSWORD_LENGTH + 3,
    );
  });
});

describe('transferErrorMessage', () => {
  test('TransferError はメッセージをそのまま表示する', () => {
    expect(transferErrorMessage(new TransferError('桁数が違います'))).toBe(
      '桁数が違います',
    );
  });

  test('ID・パスワードの誤り', () => {
    for (const code of [
      'auth/invalid-credential',
      'auth/wrong-password',
      'auth/user-not-found',
    ]) {
      expect(transferErrorMessage(new FirebaseError(code, ''))).toMatch(
        /ID またはパスワード/,
      );
    }
  });

  test('試行回数の超過・通信エラー・設定漏れ', () => {
    expect(
      transferErrorMessage(new FirebaseError('auth/too-many-requests', '')),
    ).toMatch(/試行回数/);
    expect(
      transferErrorMessage(
        new FirebaseError('auth/network-request-failed', ''),
      ),
    ).toMatch(/通信/);
    expect(
      transferErrorMessage(new FirebaseError('auth/operation-not-allowed', '')),
    ).toMatch(/Firebase の設定/);
  });

  test('想定外のエラーは汎用のメッセージ', () => {
    expect(transferErrorMessage(new Error('boom'))).toMatch(/エラーが発生/);
    expect(
      transferErrorMessage(new FirebaseError('auth/internal-error', '')),
    ).toMatch(/エラーが発生/);
  });
});

describe('loadCurrentTransferCode', () => {
  const stored = { id: 'K7QF2MXD9PRA', password: 'ABCDEFGHJKLMNPQR' };

  beforeEach(() => {
    getItemAsync.mockReset();
    mockedAuth.currentUser = null;
  });

  test('今のアカウントのコードなら返す', async () => {
    getItemAsync.mockResolvedValue(JSON.stringify(stored));
    mockedAuth.currentUser = { email: 'k7qf2mxd9pra@transfer.invalid' };
    await expect(loadCurrentTransferCode()).resolves.toEqual(stored);
  });

  test('別のアカウントのコード（アプリを入れ直した iOS など）は返さない', async () => {
    getItemAsync.mockResolvedValue(JSON.stringify(stored));
    mockedAuth.currentUser = { email: 'zzzz2222zzzz@transfer.invalid' };
    await expect(loadCurrentTransferCode()).resolves.toBeNull();
  });

  test('ログインしていない・匿名アカウント（メールなし）なら返さない', async () => {
    getItemAsync.mockResolvedValue(JSON.stringify(stored));
    await expect(loadCurrentTransferCode()).resolves.toBeNull();
  });

  test('保存されていない・読み込みに失敗した場合は null', async () => {
    mockedAuth.currentUser = { email: 'k7qf2mxd9pra@transfer.invalid' };
    getItemAsync.mockResolvedValue(null);
    await expect(loadCurrentTransferCode()).resolves.toBeNull();
    getItemAsync.mockRejectedValue(new Error('unavailable'));
    await expect(loadCurrentTransferCode()).resolves.toBeNull();
  });
});
