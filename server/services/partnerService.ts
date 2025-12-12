import { getFirestore } from '../firebase';

export interface Partner {
  id?: string;
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PartnerService {
  // private db = getFirestore();
  private collectionName = 'partners';

  private get db() {
    return getFirestore();
  }

  async getAllPartners() {
    const snapshot = await this.db
      .collection(this.collectionName)
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Partner & { id: string }));
  }

  async createPartner(partner: Partner) {
    const now = new Date();
    const docRef = await this.db.collection(this.collectionName).add({
      ...partner,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, ...partner, createdAt: now, updatedAt: now };
  }

  async getPartnerById(id: string) {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as Partner & { id: string };
  }

  async updatePartner(id: string, partner: Partial<Partner>) {
    const now = new Date();
    await this.db.collection(this.collectionName).doc(id).update({
      ...partner,
      updatedAt: now,
    });
    return { id, ...partner, updatedAt: now };
  }

  async deletePartner(id: string) {
    await this.db.collection(this.collectionName).doc(id).delete();
    return { id };
  }
}

export const partnerService = new PartnerService();
