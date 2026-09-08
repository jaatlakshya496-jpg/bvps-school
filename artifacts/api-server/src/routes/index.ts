import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import contactEmailRouter from "./contact-email";
import admissionRouter from "./admission";
import feedbackRouter from "./feedback";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/contact", contactRouter);
router.use("/contact-email", contactEmailRouter);
router.use("/admissions", admissionRouter);
router.use("/feedback", feedbackRouter);
router.use("/admin", adminRouter);

export default router;
