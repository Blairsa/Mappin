import { useEffect, useState } from 'react';
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Subscribes to maps/{mapId}/pins and exposes CRUD helpers.
 * A "map" is the shared/collaborative unit — see firestore.rules for how
 * access is scoped to the owner + memberEmails on the parent map doc.
 */
export function usePins(mapId) {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapId) return;
    const ref = collection(db, 'maps', mapId, 'pins');
    const unsub = onSnapshot(ref, (snap) => {
      setPins(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [mapId]);

  const addPin = (pin, addedByUid) =>
    addDoc(collection(db, 'maps', mapId, 'pins'), {
      ...pin,
      addedBy: addedByUid,
      createdAt: serverTimestamp(),
    });

  const updatePin = (pinId, changes) =>
    updateDoc(doc(db, 'maps', mapId, 'pins', pinId), changes);

  const deletePin = (pinId) =>
    deleteDoc(doc(db, 'maps', mapId, 'pins', pinId));

  return { pins, loading, addPin, updatePin, deletePin };
}
