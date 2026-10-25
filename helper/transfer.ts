// helper/transfer.ts
// 引き継ぎコード: 匿名アカウントに「ID + パスワード」（メール/パスワード認証）を紐づけ、
// 別の端末で同じ ID + パスワードでログインすると同じ uid（= 同じデータ）を使える。
import { FirebaseError } from 'firebase/app';
import {
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth';
import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { auth } from '@/firebaseConfig';

export type TransferCode = {
  /** 12 文字（区切りなし） */
  id: string;
  /** 16 文字（区切りなし） */
  password: string;
};

export const ID_LENGTH = 12;
export const PASSWORD_LENGTH = 16;

// 読み間違えやすい 0/O・1/I を除いた 32 文字（256 の約数なので偏りなく選べる）
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const STORAGE_KEY = 'transferCode';
// 登録できない予約済みドメイン（RFC 2606）。実際にメールが届くことはない
const EMAIL_DOMAIN = 'transfer.invalid';

const randomString = (length: number) =>
  Array.from(getRandomBytes(length), (b) => ALPHABET[b % ALPHABET.length]).join(
    '',
  );

const toEmail = (id: string) => `${id.toLowerCase()}@${EMAIL_DOMAIN}`;

/** 入力の揺れ（全角・小文字・空白・ハイフン）を取り除く */
export const normalizeCode = (input: string) =>
  input
    // 全角の英数字・記号（日本語入力のまま打った場合）を半角にする
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '');

/** 4 文字ごとにハイフンで区切る（例: K7QF-2MXD-9PRA） */
export const formatCode = (code: string) =>
  code.match(/.{1,4}/g)?.join('-') ?? code;

export class TransferError extends Error {}

export const loadTransferCode = async (): Promise<TransferCode | null> => {
  try {
    const value = await SecureStore.getItemAsync(STORAGE_KEY);
    return value ? (JSON.parse(value) as TransferCode) : null;
  } catch {
    // Web など SecureStore が使えない環境
    return null;
  }
};

/**
 * 今ログインしているアカウントの引き継ぎコード。
 * iOS のキーチェーンはアプリを消しても残るため、別アカウントのコードは返さない。
 */
export const loadCurrentTransferCode = async () => {
  const stored = await loadTransferCode();
  const email = auth.currentUser?.email;
  return stored && email === toEmail(stored.id) ? stored : null;
};

const saveTransferCode = async (code: TransferCode) => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(code));
  } catch (e) {
    console.warn('Failed to save transfer code:', e);
  }
};

/**
 * 引き継ぎコードを発行する。発行済みの場合は、ID はそのままでパスワードを作り直す
 * （以前のパスワードは使えなくなる）。
 */
export const issueTransferCode = async (): Promise<TransferCode> => {
  const user = auth.currentUser;
  if (!user) throw new TransferError('ログインしていません。');

  if (user.isAnonymous) {
    // ID が他のユーザーと重複した場合だけ作り直す（実際にはほぼ起きない）
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = {
        id: randomString(ID_LENGTH),
        password: randomString(PASSWORD_LENGTH),
      };
      try {
        await linkWithCredential(
          user,
          EmailAuthProvider.credential(toEmail(code.id), code.password),
        );
        await saveTransferCode(code);
        return code;
      } catch (e) {
        if (
          e instanceof FirebaseError &&
          e.code === 'auth/email-already-in-use'
        ) {
          continue;
        }
        throw e;
      }
    }
    throw new TransferError('コードの発行に失敗しました。');
  }

  // 再発行: パスワードの変更には直近のログインが必要なため、保存済みのコードで再認証する
  const stored = await loadCurrentTransferCode();
  if (!stored) {
    throw new TransferError(
      'この端末に発行済みのコードが保存されていないため、再発行できません。',
    );
  }
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(toEmail(stored.id), stored.password),
  );
  const code = { id: stored.id, password: randomString(PASSWORD_LENGTH) };
  await updatePassword(user, code.password);
  await saveTransferCode(code);
  return code;
};

/** 引き継ぎコードでログインし、コードの持ち主のデータに切り替える */
export const redeemTransferCode = async (idInput: string, pwInput: string) => {
  const code = {
    id: normalizeCode(idInput),
    password: normalizeCode(pwInput),
  };
  if (
    code.id.length !== ID_LENGTH ||
    code.password.length !== PASSWORD_LENGTH
  ) {
    throw new TransferError('コードの桁数が正しくありません。');
  }
  await signInWithEmailAndPassword(auth, toEmail(code.id), code.password);
  await saveTransferCode(code);
};

/** エラーを画面に表示する文言に変換する */
export const transferErrorMessage = (e: unknown) => {
  if (e instanceof TransferError) return e.message;
  if (e instanceof FirebaseError) {
    switch (e.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        return 'ID またはパスワードが正しくありません。';
      case 'auth/too-many-requests':
        return '試行回数が多すぎます。しばらく待ってからお試しください。';
      case 'auth/network-request-failed':
        return '通信に失敗しました。通信環境を確認してください。';
      case 'auth/operation-not-allowed':
        return '引き継ぎ機能が有効になっていません（Firebase の設定を確認してください）。';
      default:
        break;
    }
  }
  return 'エラーが発生しました。もう一度お試しください。';
};
