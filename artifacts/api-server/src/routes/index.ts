import { Router, type IRouter } from "express";
import healthRouter from "./health";
import vehiclesRouter from "./vehicles";
import customersRouter from "./customers";
import rentalsRouter from "./rentals";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/customers", customersRouter);
router.use("/rentals", rentalsRouter);
router.get("/dashboard/stats", async (req, res) => {
  res.redirect("/api/rentals/stats");
});

export default router;
