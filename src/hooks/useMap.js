import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * A single map doc by id: { name, ownerUid, ownerEmail, memberEmails[], tags{} }.
 * Sharing = adding an email to memberEmails; firestore.rules checks the
 * signed-in user's auth token email against that array. Map creation now
 * lives in useMaps.js, since a user can have more than one map.
 */
export function useMap(mapId) {
  const [mapDoc, setMapDoc] = useState(mapId ? undefined : null);

  useEffect(() => {
    if (!mapId) { setMapDoc(null); return; }
    return onSnapshot(doc(db, 'maps', mapId), (snap) => {
      setMapDoc(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  }, [mapId]);

  const addCollaborator = (email) =>
    updateDoc(doc(db, 'maps', mapId), { memberEmails: arrayUnion(email.toLowerCase()) });

  const removeCollaborator = (email) =>
    updateDoc(doc(db, 'maps', mapId), { memberEmails: arrayRemove(email.toLowerCase()) });

  const updateTags = (tags) =>
    updateDoc(doc(db, 'maps', mapId), { tags });

  const renameMap = (name) =>
    updateDoc(doc(db, 'maps', mapId), { name });

  return { mapDoc, addCollaborator, removeCollaborator, updateTags, renameMap };
}
