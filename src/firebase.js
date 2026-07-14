import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRE2b0tJxKlQkbXcfuyP20xtRq5Ax-4ok",
  authDomain: "quanlytaisan-235e5.firebaseapp.com",
  databaseURL: "https://quanlytaisan-235e5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quanlytaisan-235e5",
  storageBucket: "quanlytaisan-235e5.firebasestorage.app",
  messagingSenderId: "793835259727",
  appId: "1:793835259727:web:279f30e0b9fa883d4ce73a",
  measurementId: "G-RQNZB910J3"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);