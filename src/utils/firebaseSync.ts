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

const COLLECTION_NAME = "institutions";

/**
 * Loads all institutions from the Firestore collection.
 * If the collection is empty, seeds it with default dummy data and returns them.
 */
export async function loadInstitutions(): Promise<Institution[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const list: Institution[] = [];
    
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
        batch.set(docRef, inst);
      });
      await batch.commit();
      
      console.log("Seeding completed successfully.");
      return defaultData;
    }

    console.log(`Loaded ${list.length} institutions from Firestore.`);
    return list;
  } catch (error) {
    console.error("Error loading institutions from Firestore:", error);
    // Fallback to offline local storage if Firebase is unreachable
    const saved = localStorage.getItem('lkp_institutions');
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
}

/**
 * Saves a single institution to Firestore
 */
export async function saveInstitutionToFirestore(inst: Institution): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, inst.id);
    await setDoc(docRef, inst);
  } catch (error) {
    console.error(`Error saving institution ${inst.id} to Firestore:`, error);
  }
}

/**
 * Deletes a single institution from Firestore
 */
export async function deleteInstitutionFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting institution ${id} from Firestore:`, error);
  }
}
