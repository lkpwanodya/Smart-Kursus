import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from "firebase/firestore";
import { db } from "./firebase";
import { Institution } from "../types";
import { DUMMY_INSTITUTIONS } from "./dummyData";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Safely removes any undefined fields recursively so Firestore doesn't reject the write.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj as any)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
}

const COLLECTION_NAME = "institutions";

/**
 * Loads all institutions from the Firestore collection.
 * If the collection is empty, seeds it with default dummy data and returns them.
 */
export async function loadInstitutions(): Promise<Institution[]> {
  let querySnapshot;
  try {
    querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  } catch (error) {
    // If permission or connection issues happen, log using the required JSON format
    try {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    } catch (loggedErr) {
      console.error("Firestore logging finished. Attempting local fallback...", loggedErr);
    }
    // Fallback to offline local storage if Firebase is unreachable
    const saved = localStorage.getItem('lembaga_institutions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse fallback local storage");
      }
    }
    return DUMMY_INSTITUTIONS();
  }

  try {
    let list: Institution[] = [];
    
    querySnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Institution);
    });

    if (list.length === 0) {
      console.log("No institutions found in Firestore. Seeding default data...");
      const defaultData = DUMMY_INSTITUTIONS();
      
      // Seed each institution as a separate document
      const batch = writeBatch(db);
      defaultData.forEach((inst) => {
        const docRef = doc(db, COLLECTION_NAME, inst.id);
        batch.set(docRef, sanitizeForFirestore(inst));
      });
      await batch.commit();
      
      console.log("Seeding completed successfully.");
      return defaultData;
    }

    // Sync staffCredentials and specialty from seed if missing or empty
    const seed = DUMMY_INSTITUTIONS();
    let updatedNeeded = false;
    list = list.map((inst) => {
      const seedInst = seed.find(s => s.id === inst.id);
      if (seedInst) {
        let changed = false;
        if (!inst.staffCredentials || inst.staffCredentials.length === 0) {
          inst.staffCredentials = seedInst.staffCredentials;
          changed = true;
        }
        if (!inst.profile.specialty && seedInst.profile.specialty) {
          inst.profile.specialty = seedInst.profile.specialty;
          changed = true;
        }
        if (changed) {
          updatedNeeded = true;
        }
      }
      return inst;
    });

    if (updatedNeeded) {
      console.log("Some institutions were missing staffCredentials. Syncing back to Firestore...");
      const batch = writeBatch(db);
      list.forEach((inst) => {
        const docRef = doc(db, COLLECTION_NAME, inst.id);
        batch.set(docRef, sanitizeForFirestore(inst));
      });
      await batch.commit();
    }

    console.log(`Loaded ${list.length} institutions from Firestore.`);
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
}

/**
 * Saves a single institution to Firestore
 */
export async function saveInstitutionToFirestore(inst: Institution): Promise<void> {
  const path = `${COLLECTION_NAME}/${inst.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, inst.id);
    await setDoc(docRef, sanitizeForFirestore(inst));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a single institution from Firestore
 */
export async function deleteInstitutionFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

