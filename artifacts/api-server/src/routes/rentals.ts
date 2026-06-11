import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { rentalsTable, vehiclesTable, customersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import {
  CreateRentalBody,
  UpdateRentalBody,
  GetRentalParams,
  UpdateRentalParams,
  ListRentalsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getRentalWithDetails(id: number) {
  const rental = await db.select().from(rentalsTable).where(eq(rentalsTable.id, id));
  if (!rental[0]) return null;
  const vehicle = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, rental[0].vehicleId));
  const customer = await db.select().from(customersTable).where(eq(customersTable.id, rental[0].customerId));
  if (!vehicle[0] || !customer[0]) return null;
  return {
    ...rental[0],
    dailyRate: parseFloat(rental[0].dailyRate),
    totalCost: rental[0].totalCost ? parseFloat(rental[0].totalCost) : null,
    vehicle: { ...vehicle[0], dailyRate: parseFloat(vehicle[0].dailyRate) },
    customer: customer[0],
  };
}

router.get("/", async (req, res) => {
  try {
    const query = ListRentalsQueryParams.parse(req.query);
    let rentals = await db.select().from(rentalsTable);
    if (query.status) {
      rentals = rentals.filter((r) => r.status === query.status);
    }
    if (query.customerId) {
      rentals = rentals.filter((r) => r.customerId === query.customerId);
    }
    if (query.vehicleId) {
      rentals = rentals.filter((r) => r.vehicleId === query.vehicleId);
    }

    const results = await Promise.all(
      rentals.map(async (r) => {
        const vehicle = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, r.vehicleId));
        const customer = await db.select().from(customersTable).where(eq(customersTable.id, r.customerId));
        return {
          ...r,
          dailyRate: parseFloat(r.dailyRate),
          totalCost: r.totalCost ? parseFloat(r.totalCost) : null,
          vehicle: vehicle[0] ? { ...vehicle[0], dailyRate: parseFloat(vehicle[0].dailyRate) } : null,
          customer: customer[0] ?? null,
        };
      })
    );
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to list rentals");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateRentalBody.parse(req.body);

    const vehicle = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, body.vehicleId));
    if (!vehicle[0]) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    if (vehicle[0].status !== "available") {
      res.status(400).json({ error: "Vehicle is not available" });
      return;
    }

    const [rental] = await db
      .insert(rentalsTable)
      .values({
        ...body,
        dailyRate: String(body.dailyRate),
        status: "active",
      })
      .returning();

    await db.update(vehiclesTable).set({ status: "rented", updatedAt: new Date() }).where(eq(vehiclesTable.id, body.vehicleId));

    const result = await getRentalWithDetails(rental.id);
    res.status(201).json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to create rental");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const vehicles = await db.select().from(vehiclesTable);
    const customers = await db.select().from(customersTable);
    const rentals = await db.select().from(rentalsTable);

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRentals = rentals.filter((r) => {
      const created = new Date(r.createdAt);
      return created >= firstDayOfMonth && r.status === "completed" && r.totalCost;
    });

    const totalRevenue = rentals
      .filter((r) => r.status === "completed" && r.totalCost)
      .reduce((sum, r) => sum + parseFloat(r.totalCost!), 0);

    const monthlyRevenue = monthlyRentals.reduce((sum, r) => sum + parseFloat(r.totalCost!), 0);

    res.json({
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter((v) => v.status === "available").length,
      rentedVehicles: vehicles.filter((v) => v.status === "rented").length,
      maintenanceVehicles: vehicles.filter((v) => v.status === "maintenance").length,
      totalCustomers: customers.length,
      activeRentals: rentals.filter((r) => r.status === "active").length,
      completedRentals: rentals.filter((r) => r.status === "completed").length,
      totalRevenue,
      monthlyRevenue,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetRentalParams.parse({ id: parseInt(req.params.id) });
    const result = await getRentalWithDetails(id);
    if (!result) {
      res.status(404).json({ error: "Rental not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get rental");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = UpdateRentalParams.parse({ id: parseInt(req.params.id) });
    const body = UpdateRentalBody.parse(req.body);

    const existingRental = await db.select().from(rentalsTable).where(eq(rentalsTable.id, id));
    if (!existingRental[0]) {
      res.status(404).json({ error: "Rental not found" });
      return;
    }

    const updateData: Record<string, unknown> = { ...body, updatedAt: new Date() };
    if (body.totalCost !== undefined) {
      updateData.totalCost = body.totalCost !== null ? String(body.totalCost) : null;
    }

    const [updated] = await db
      .update(rentalsTable)
      .set(updateData)
      .where(eq(rentalsTable.id, id))
      .returning();

    if (body.status === "completed" || body.status === "cancelled") {
      await db
        .update(vehiclesTable)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(vehiclesTable.id, existingRental[0].vehicleId));
    }

    const result = await getRentalWithDetails(id);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to update rental");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
