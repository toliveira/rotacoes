import { getFirestore } from '../firebase';

export interface Car {
  id?: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  fuel: string;
  motorPower: number;
  engineSize?: number;
  origin?: string;
  lastMaintenanceDate?: Date;
  description?: string;
  imageUrls?: string[];
  featured?: boolean;
  status?: 'available' | 'sold' | 'reserved';
  purchasePrice?: number;
  soldPrice?: number;
  soldTo?: string;
  soldDate?: Date;
  
  // New fields
  vehicleType?: string;
  bodyType?: string;
  transmission?: string;
  traction?: string;
  condition?: string;
  colorExterior?: string;
  colorInterior?: string;
  doors?: string;
  seats?: number;
  equipment?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export class CarService {
  // private db = getFirestore();
  private collectionName = 'cars';

  private get db() {
    return getFirestore();
  }

  async getAllCars(filters?: {
    brand?: string;
    model?: string;
    minYear?: number;
    maxYear?: number;
    minPrice?: number;
    maxPrice?: number;
    minKm?: number;
    maxKm?: number;
    fuel?: string;
    minPower?: number;
    maxPower?: number;
    origin?: string;
    status?: string;
    soldTo?: string;
  }) {
    let query: any = this.db.collection(this.collectionName);

    if (filters?.brand) {
      query = query.where('brand', '==', filters.brand);
    }
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters?.soldTo) {
      query = query.where('soldTo', '==', filters.soldTo);
    }
    if (filters?.model) {
      query = query.where('model', '==', filters.model);
    }
    if (filters?.minYear) {
      query = query.where('year', '>=', filters.minYear);
    }
    if (filters?.maxYear) {
      query = query.where('year', '<=', filters.maxYear);
    }
    if (filters?.minPrice) {
      query = query.where('price', '>=', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.where('price', '<=', filters.maxPrice);
    }
    if (filters?.minKm) {
      query = query.where('km', '>=', filters.minKm);
    }
    if (filters?.maxKm) {
      query = query.where('km', '<=', filters.maxKm);
    }
    if (filters?.fuel) {
      query = query.where('fuel', '==', filters.fuel);
    }
    if (filters?.minPower) {
      query = query.where('motorPower', '>=', filters.minPower);
    }
    if (filters?.maxPower) {
      query = query.where('motorPower', '<=', filters.maxPower);
    }
    if (filters?.origin) {
      query = query.where('origin', '==', filters.origin);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Car & { id: string }));
  }

  async getCarById(id: string) {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as Car & { id: string };
  }

  async createCar(car: Car) {
    const now = new Date();
    const docRef = await this.db.collection(this.collectionName).add({
      ...car,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, ...car, createdAt: now, updatedAt: now };
  }

  async updateCar(id: string, car: Partial<Car>) {
    const now = new Date();
    await this.db.collection(this.collectionName).doc(id).update({
      ...car,
      updatedAt: now,
    });
    return { id, ...car, updatedAt: now };
  }

  async deleteCar(id: string) {
    await this.db.collection(this.collectionName).doc(id).delete();
    return { id };
  }

  async getFeaturedCars(limit: number = 6) {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where('featured', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Car & { id: string }));
  }
}

export const carService = new CarService();
