// src/useAuth.js — 로그인·로그아웃·사용자 상태 관리
import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        // Firestore 프로필 로드
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        if (snap.exists()) setProfile(snap.data());
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // 구글 로그인
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureProfile(result.user);
    return result.user;
  };

  // 이메일 로그인
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  // 이메일 회원가입
  const registerWithEmail = async (email, password, displayName, role) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await ensureProfile(result.user, { displayName, role });
    return result.user;
  };

  // Firestore 프로필 생성 (최초 1회)
  const ensureProfile = async (fbUser, extra = {}) => {
    const ref  = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const data = {
        uid:         fbUser.uid,
        displayName: extra.displayName || fbUser.displayName || "이름 없음",
        email:       fbUser.email,
        role:        extra.role || "dad",   // 'dad' | 'child'
        familyId:    null,
        createdAt:   serverTimestamp(),
        avatar:      fbUser.photoURL || null,
      };
      await setDoc(ref, data);
      setProfile(data);
    } else {
      setProfile(snap.data());
    }
  };

  const logout = () => signOut(auth);

  return { user, profile, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout };
}
