import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { vehiclesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  CreateVehicleBody,
  UpdateVehicleBody,
  GetVehicleParams,
  UpdateVehicleParams,
  DeleteVehicleParams,
  ListVehiclesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListVehiclesQueryParams.parse(req.query);
    let vehicles = await db.select().from(vehiclesTable);
    if (query.status) {
      vehicles = vehicles.filter((v) => v.status === query.status);
    }
    if (query.category) {
      vehicles = vehicles.filter((v) => v.category === query.category);
    }
    res.json(
      vehicles.map((v) => ({
        ...v,
        dailyRate: parseFloat(v.dailyRate),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list vehicles");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateVehicleBody.parse(req.body);
    const [vehicle] = await db
      .insert(vehiclesTable)
      .values({
        ...body,
        dailyRate: String(body.dailyRate),
        mileage: body.mileage ?? 0,
        fuelType: body.fuelType ?? "Gasoline",
        transmission: body.transmission ?? "Automatic",
        seats: body.seats ?? 5,
        status: body.status ?? "available",
      })
      .returning();
    res.status(201).json({ ...vehicle, dailyRate: parseFloat(vehicle.dailyRate) });
  } catch (err) {
    req.log.error({ err }, "Failed to create vehicle");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetVehicleParams.parse({ id: parseInt(req.params.id) });
    const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, id));
    if (!vehicle) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    res.json({ ...vehicle, dailyRate: parseFloat(vehicle.dailyRate) });
  } catch (err) {
    req.log.error({ err }, "Failed to get vehicle");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = UpdateVehicleParams.parse({ id: parseInt(req.params.id) });
    const body = UpdateVehicleBody.parse(req.body);
    const updateData: Record<string, unknown> = { ...body, updatedAt: new Date() };
    if (body.dailyRate !== undefined) {
      updateData.dailyRate = String(body.dailyRate);
    }
    const [vehicle] = await db
      .update(vehiclesTable)
      .set(updateData)
      .where(eq(vehiclesTable.id, id))
      .returning();
    if (!vehicle) {
      res.status(404).json({ error: "Vehicle not found" });
      return;
    }
    res.json({ ...vehicle, dailyRate: parseFloat(vehicle.dailyRate) });
  } catch (err) {
    req.log.error({ err }, "Failed to update vehicle");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = DeleteVehicleParams.parse({ id: parseInt(req.params.id) });
    await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete vehicle");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
