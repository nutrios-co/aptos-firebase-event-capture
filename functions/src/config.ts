import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import firebaseServiceKey from "../../../nutrios-protocol/api/secret/key.json";

initializeApp({
  credential: cert(firebaseServiceKey as any),
});

export const db = getFirestore();

export const NODE_URL = "https://fullnode.devnet.aptoslabs.com";
