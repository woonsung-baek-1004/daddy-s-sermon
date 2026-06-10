// src/useSermons.js — 설교 업로드·조회·댓글·좋아요
import { useState, useEffect, useCallback } from "react";
import {
  collection, addDoc, getDocs, getDoc, doc,
  query, where, orderBy, onSnapshot,
  updateDoc, arrayUnion, arrayRemove,
  serverTimestamp, deleteDoc,
} from "firebase/firestore";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

// ── 설교 목록 실시간 구독 ─────────────────────
export function useSermons(track = "both", familyId = null) {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (track === "family" && familyId) {
      q = query(
        collection(db, "sermons"),
        where("familyId", "==", familyId),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "sermons"),
        where("track", "in", ["community", "both"]),
        orderBy("createdAt", "desc")
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      setSermons(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [track, familyId]);

  return { sermons, loading };
}

// ── 설교 업로드 (텍스트 전용 — Storage 불필요) ────
export function useUploadSermon() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadSermon = useCallback(async ({
    user, profile, verse, title, text,
    audioBlob, docFile, type, track, tags = [],
  }) => {
    setUploading(true);
    setProgress(0);
    try {
      // Firestore 에 텍스트만 저장 (Storage 없이 동작)
      const docData = {
        uid:         user.uid,
        dadName:     profile?.displayName || user.displayName || "아빠",
        dadRole:     profile?.dadRole || profile?.role || "아빠",
        familyId:    profile?.familyId || null,
        verse:       verse || "",
        title:       title || "",
        text:        text  || "",
        fileUrl:     null,
        fileName:    null,
        type:        type  || "text",
        track:       track || "family",
        tags,
        likes:       [],
        createdAt:   serverTimestamp(),
      };
      setProgress(80);
      const docRef = await addDoc(collection(db, "sermons"), docData);
      setProgress(100);
      setUploading(false);
      return docRef.id;
    } catch (e) {
      setUploading(false);
      throw e;
    }
  return { uploadSermon, progress, uploading };
}

// ── 좋아요 토글 ───────────────────────────────
export async function toggleLike(sermonId, uid) {
  const ref_ = doc(db, "sermons", sermonId);
  const snap = await getDoc(ref_);
  const likes = snap.data()?.likes || [];
  if (likes.includes(uid)) {
    await updateDoc(ref_, { likes: arrayRemove(uid) });
  } else {
    await updateDoc(ref_, { likes: arrayUnion(uid) });
  }
}

// ── 댓글 실시간 구독 ──────────────────────────
export function useComments(sermonId) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!sermonId) return;
    const q = query(
      collection(db, "sermons", sermonId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [sermonId]);

  return comments;
}

// ── 댓글 추가 ─────────────────────────────────
export async function addComment(sermonId, user, profile, text) {
  await addDoc(collection(db, "sermons", sermonId, "comments"), {
    uid:         user.uid,
    displayName: profile?.displayName || user.displayName,
    role:        profile?.role || "dad",
    text,
    createdAt:   serverTimestamp(),
  });
}

// ── 댓글 삭제 ─────────────────────────────────
export async function deleteComment(sermonId, commentId) {
  await deleteDoc(doc(db, "sermons", sermonId, "comments", commentId));
}
