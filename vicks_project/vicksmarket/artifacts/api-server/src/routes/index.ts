import { Router, type IRouter } from "express";
import healthRouter   from "./health.js";
import productsRouter from "./products.js";
import usersRouter    from "./users.js";
import ordersRouter   from "./orders.js";
import merchantRouter from "./merchant.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(usersRouter);
router.use(ordersRouter);
router.use(merchantRouter);

export default router;
