import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import contactEmailRouter from "./contact-email";
import admissionRouter from "./admission";
import feedbackRouter from "./feedback";
import principalMessagesRouter from "./principal-messages";
import feesRouter from "./fees";
import blogRouter from "./blog";
import adminRouter from "./admin";
import chatRouter from "./chat";
import contentRouter from "./content";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/contact", contactRouter);
router.use("/contact-email", contactEmailRouter);
router.use("/admissions", admissionRouter);
router.use("/feedback", feedbackRouter);
router.use("/principal-messages", principalMessagesRouter);
router.use("/fees", feesRouter);
router.use("/blog", blogRouter);
router.use("/admin", adminRouter);
router.use("/content", contentRouter);
router.use(chatRouter);

export default router;
