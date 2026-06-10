// ─────────────────────────────────────────────
// src/firebase.js
// Firebase 설정 파일
//
// ⚠️  아래 firebaseConfig 값을 본인의 Firebase 프로젝트 값으로 교체하세요
//    Firebase Console → 프로젝트 설정 → 앱 추가(웹) → 설정 값 복사
// ─────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            "AIzaSyBGveron0fLQxFx6llcw1_w6DgDmIsEUVs",
  authDomain:        "daddy-s-sermon.firebaseapp.com",
  projectId:         "daddy-s-sermon",
  storageBucket:     "daddy-s-sermon.firebasestorage.app",
  messagingSenderId: "470935272164",
  appId:             "1:470935272164:web:df9241bbbcdc975fd78af1",
};

const app       = initializeApp(firebaseConfig);
export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const storage   = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// 푸시 알림은 브라우저 지원 여부 확인 후 초기화
export let messaging = null;
isSupported().then((ok) => {
  if (ok) messaging = getMessaging(app);
});

export default app;
