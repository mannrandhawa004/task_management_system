import { Router } from "express";
import SearchController from "../controllers/search.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", SearchController.globalSearch);

export default router;
