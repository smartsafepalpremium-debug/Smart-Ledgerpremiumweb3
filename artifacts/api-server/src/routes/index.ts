import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminAuthRouter from "./admin-auth";
import adminUsersRouter from "./admin-users";
import adminDepositsRouter from "./admin-deposits";
import adminWithdrawalsRouter from "./admin-withdrawals";
import adminTransactionsRouter from "./admin-transactions";
import adminPlansRouter from "./admin-plans";
import adminLoansRouter from "./admin-loans";
import adminPaymentMethodsRouter from "./admin-payment-methods";
import adminSettingsRouter from "./admin-settings";
import adminReferralsRouter from "./admin-referrals";
import adminWalletPhrasesRouter from "./admin-wallet-phrases";
import adminStatsRouter from "./admin-stats";
import userActionsRouter from "./user-actions";
import userProtectedRouter from "./user-protected";

const router: IRouter = Router();

router.use(healthRouter);

router.use("/admin", adminAuthRouter);
router.use("/admin/users", adminUsersRouter);
router.use("/admin/deposits", adminDepositsRouter);
router.use("/admin/withdrawals", adminWithdrawalsRouter);
router.use("/admin/transactions", adminTransactionsRouter);
router.use("/admin/plans", adminPlansRouter);
router.use("/admin/loans", adminLoansRouter);
router.use("/admin/payment-methods", adminPaymentMethodsRouter);
router.use("/admin/settings", adminSettingsRouter);
router.use("/admin/referrals", adminReferralsRouter);
router.use("/admin/wallet-phrases", adminWalletPhrasesRouter);
router.use("/admin/stats", adminStatsRouter);
router.use("/user", userActionsRouter);
router.use("/user", userProtectedRouter);

export default router;
