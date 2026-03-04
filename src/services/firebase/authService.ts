import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "@firebase/auth";

import { doc, setDoc, serverTimestamp } from "@firebase/firestore";

import { auth } from "@/firebase/auth";
import { db } from "@/firebase/firestore";
import type { IAuthService } from "../interfaces/IAuthService";

export class FirebaseAuthService implements IAuthService {
  async login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  }

  async register(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const user = credential.user;

    // 🔥 Create Firestore user document
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: serverTimestamp(),
    });

    return user;
  }

  async logout() {
    await signOut(auth);
  }

  observeAuthState(callback: (user: any | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}
