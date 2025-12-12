import { getFirestore } from '../firebase';
import { ENV } from '../_core/env';

export interface User {
  uid?: string;
  name?: string | null;
  email?: string | null;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
  lastSignedIn?: Date;
}

export class UserService {
  // private db = getFirestore();
  private collectionName = 'users';

  private get db() {
    return getFirestore();
  }

  async upsertUser(user: Partial<User> & { uid: string }): Promise<void> {
    if (!user.uid) {
      throw new Error("User uid is required for upsert");
    }

    const usersRef = this.db.collection(this.collectionName).doc(user.uid);
    const snapshot = await usersRef.get();

    const now = new Date();
    const userData: any = { ...user };

    if (!snapshot.exists) {
      // Create
      if (!userData.role) userData.role = 'user';
      
      await usersRef.set({
        ...userData,
        createdAt: now,
        updatedAt: now,
        lastSignedIn: userData.lastSignedIn || now,
      });
    } else {
      // Update
      const existingData = snapshot.data();
      if (!existingData) {
        throw new Error("User document exists but has no data");
      }
      
      const updateData: any = {
        ...userData,
        updatedAt: now,
        lastSignedIn: userData.lastSignedIn || now,
      };

      // Preserve existing role if not provided in update
      if (!userData.role) {
        updateData.role = existingData.role;
      }

      await usersRef.update(updateData);
    }
  }

  async getUser(uid: string): Promise<User | undefined> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .doc(uid)
      .get();

    if (!snapshot.exists) {
      return undefined;
    }

    const data = snapshot.data();
    
    // Convert Firestore timestamps to Date objects if necessary
    // Firestore SDK usually returns Timestamp objects, but we typed them as Date in interface.
    // We might need to convert.
    const convertDate = (d: any) => d && typeof d.toDate === 'function' ? d.toDate() : d;

    return {
      uid: snapshot.id,
      name: data?.name || null,
      email: data?.email || null,
      role: data?.role || 'user',
      createdAt: convertDate(data?.createdAt),
      updatedAt: convertDate(data?.updatedAt),
      lastSignedIn: convertDate(data?.lastSignedIn)
    }
  }
}

export const userService = new UserService();
