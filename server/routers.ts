import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { carService, Car } from "./services/carService";
import { partnerService } from "./services/partnerService";
import { clientService } from "./services/clientService";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  cars: router({
    list: publicProcedure
      .input(
        z.object({
          brand: z.string().optional(),
          model: z.string().optional(),
          minYear: z.number().int().optional(),
          maxYear: z.number().int().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          minKm: z.number().optional(),
          maxKm: z.number().optional(),
          fuel: z.string().optional(),
          minPower: z.number().optional(),
          maxPower: z.number().optional(),
          origin: z.string().optional(),
          status: z.string().optional(),
          soldTo: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return carService.getAllCars(input);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.string().min(1) }))
      .query(async ({ input }) => {
        return carService.getCarById(input.id);
      }),
    create: adminProcedure
      .input(
        z.object({
          brand: z.string().min(1),
          model: z.string().min(1),
          year: z.number().int(),
          price: z.number(),
          km: z.number(),
          fuel: z.string().min(1),
          motorPower: z.number(),
          engineSize: z.number().optional(),
          origin: z.string().optional(),
          lastMaintenanceDate: z.coerce.date().optional(),
          description: z.string().optional(),
          imageUrls: z.array(z.string()).optional(),
          featured: z.boolean().optional(),
          purchasePrice: z.number().optional(),
          
          // New fields
          vehicleType: z.string().optional(),
          bodyType: z.string().optional(),
          transmission: z.string().optional(),
          traction: z.string().optional(),
          condition: z.string().optional(),
          colorExterior: z.string().optional(),
          colorInterior: z.string().optional(),
          doors: z.string().optional(),
          seats: z.coerce.number().optional(),
          equipment: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return carService.createCar(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.string().min(1),
          data: z.object({
            brand: z.string().min(1).optional(),
            model: z.string().min(1).optional(),
            year: z.number().int().optional(),
            price: z.number().optional(),
            km: z.number().optional(),
            fuel: z.string().min(1).optional(),
            motorPower: z.number().optional(),
            engineSize: z.number().optional(),
            origin: z.string().optional(),
            lastMaintenanceDate: z.coerce.date().optional(),
            description: z.string().optional(),
            imageUrls: z.array(z.string()).optional(),
            featured: z.boolean().optional(),
            purchasePrice: z.number().optional(),
            status: z.enum(['available', 'sold', 'reserved']).optional(),
            soldPrice: z.number().optional(),
            soldTo: z.string().optional(),
            soldDate: z.coerce.date().optional(),
            
            // New fields
            vehicleType: z.string().optional(),
            bodyType: z.string().optional(),
            transmission: z.string().optional(),
            traction: z.string().optional(),
            condition: z.string().optional(),
            colorExterior: z.string().optional(),
            colorInterior: z.string().optional(),
            doors: z.string().optional(),
            seats: z.coerce.number().optional(),
            equipment: z.array(z.string()).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return carService.updateCar(input.id, input.data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return carService.deleteCar(input.id);
      }),
  }),

  partners: router({
    list: publicProcedure.query(async () => {
      return partnerService.getAllPartners();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.string().min(1) }))
      .query(async ({ input }) => {
        return partnerService.getPartnerById(input.id);
      }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          logoUrl: z.string().url().optional(),
          website: z.string().url().optional(),
          description: z.string().optional()
        })
      )
      .mutation(async ({ input }) => {
        return partnerService.createPartner(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.string().min(1),
          data: z.object({
            name: z.string().min(1).optional(),
            logoUrl: z.string().url().optional(),
            website: z.string().url().optional(),
            description: z.string().optional()
          }),
        })
      )
      .mutation(async ({ input }) => {
        return partnerService.updatePartner(input.id, input.data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.string().min(1) }))
      .mutation(async ({ input }) => {
        return partnerService.deletePartner(input.id);
      }),
  }),

  clients: router({
    list: adminProcedure
      .input(z.object({ name: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return clientService.getAllClients(input);
      }),
    get: adminProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return clientService.getClientById(input);
      }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email().optional().or(z.literal('')),
          phone: z.string().optional(),
          nif: z.string().optional(),
          address: z.string().optional(),
          notes: z.string().optional(),
          files: z.array(z.object({ name: z.string(), url: z.string(), uploadedAt: z.date() })).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return clientService.createClient(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          data: z.object({
            name: z.string().optional(),
            email: z.string().email().optional().or(z.literal('')),
            phone: z.string().optional(),
            nif: z.string().optional(),
            address: z.string().optional(),
            notes: z.string().optional(),
            files: z.array(z.object({ name: z.string(), url: z.string(), uploadedAt: z.date() })).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return clientService.updateClient(input.id, input.data);
      }),
    delete: adminProcedure
      .input(z.string())
      .mutation(async ({ input }) => {
        return clientService.deleteClient(input);
      }),
  }),

  dashboard: router({
    stats: adminProcedure.query(async () => {
        const cars = await carService.getAllCars();
        const availableCars = cars.filter((c: Car) => c.status === 'available' || !c.status).length;
        const soldCars = cars.filter((c: Car) => c.status === 'sold');
        const totalSales = soldCars.reduce((sum: number, car: Car) => sum + (car.soldPrice || 0), 0);
        const totalSpends = cars.reduce((sum: number, car: Car) => sum + (car.purchasePrice || 0), 0);
        
        const feed = [
            { id: 1, title: "New ISV Tax Rates 2025", date: new Date(), type: "law", content: "The government has approved new ISV rates...", url: "#" },
            { id: 2, title: "Electric Vehicle Incentives", date: new Date(Date.now() - 86400000), type: "news", content: "Apply for the new efficiency fund...", url: "#" },
            { id: 3, title: "Used Car Market Report", date: new Date(Date.now() - 172800000), type: "business", content: "Prices are stabilizing...", url: "#" },
        ];

        const salesChart = [
            { name: 'Jan', sales: 4000 },
            { name: 'Feb', sales: 3000 },
            { name: 'Mar', sales: 2000 },
            { name: 'Apr', sales: 2780 },
            { name: 'May', sales: 1890 },
            { name: 'Jun', sales: 2390 },
        ];

        return {
            availableCars,
            totalSales,
            totalSpends,
            feed,
            salesChart
        };
    })
  }),
});

export type AppRouter = typeof appRouter;
