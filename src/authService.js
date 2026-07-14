import { auth, db } from "./firebase";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  get,
  ref,
} from "firebase/database";

export const login = async (email, password) => {
  return signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
};

export const logout = async () => {
  return signOut(auth);
};

export const watchAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (uid) => {
  const snapshot = await get(
    ref(db, `users/${uid}`)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    uid,
    ...snapshot.val(),
  };
};