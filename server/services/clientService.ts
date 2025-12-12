import { getFirestore } from '../firebase';

export interface Client {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  nif?: string;
  address?: string;
  notes?: string;
  files?: { name: string; url: string; uploadedAt: Date }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class ClientService {
  private collectionName = 'clients';

  private get db() {
    return getFirestore();
  }

  async getAllClients(filters?: { name?: string; email?: string }) {
    let query: any = this.db.collection(this.collectionName);

    // Simple filtering - Firestore doesn't support partial string match natively without external tools
    // So we might fetch all and filter in memory if list is small, or use exact match
    // For now, I'll just return all ordered by createdAt
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    let clients = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Client & { id: string }));

    if (filters?.name) {
      const lowerName = filters.name.toLowerCase();
      clients = clients.filter((c: Client) => c.name.toLowerCase().includes(lowerName));
    }
    
    if (filters?.email) {
      const lowerEmail = filters.email.toLowerCase();
      clients = clients.filter((c: Client) => c.email?.toLowerCase().includes(lowerEmail));
    }

    return clients;
  }

  async getClientById(id: string) {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as Client & { id: string };
  }

  async createClient(client: Client) {
    const now = new Date();
    const docRef = await this.db.collection(this.collectionName).add({
      ...client,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, ...client, createdAt: now, updatedAt: now };
  }

  async updateClient(id: string, client: Partial<Client>) {
    const now = new Date();
    await this.db.collection(this.collectionName).doc(id).update({
      ...client,
      updatedAt: now,
    });
    return { id, ...client, updatedAt: now };
  }

  async deleteClient(id: string) {
    await this.db.collection(this.collectionName).doc(id).delete();
    return { id };
  }
}

export const clientService = new ClientService();
