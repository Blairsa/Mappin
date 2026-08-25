import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase.js';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const signIn = () => signInWithPopup(auth, googleProvider);
  const signOutUser = () => signOut(auth);

  return { user, signIn, signOut: signOutUser };
}
