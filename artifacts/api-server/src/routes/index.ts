import { Router, type IRouter } from "express";
import healthRouter from "./health";
import resumeRouter from "./resume";
import analyzeRouter from "./analyze";
import cardImageRouter from "./card-image";

const router: IRouter = Router();

router.use(healthRouter);
router.use(resumeRouter);
router.use(analyzeRouter);
router.use(cardImageRouter);

export default router;
