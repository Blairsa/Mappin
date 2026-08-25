import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Every map a signed-in user belongs to — owned or shared with them.
 * Firestore's array-contains query does the membership check, backed up
 * by firestore.rules on the read/write side.
 */
export function useMaps(userEmail) {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    const q = query(collection(db, 'maps'), where('memberEmails', 'array-contains', userEmail));
    return onSnapshot(q, (snap) => {
      setMaps(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [userEmail]);

  const createMap = async (ownerUid, ownerEmail, name) => {
    const ref = doc(collection(db, 'maps')); // auto-generated id — no longer tied to a single user
    await setDoc(ref, {
      name: name || 'New map',
      ownerUid,
      ownerEmail,
      memberEmails: [ownerEmail],
      tags: {},
      createdAt: serverTimestamp(),
    });
    return ref.id;
  };

  return { maps, loading, createMap };
}
