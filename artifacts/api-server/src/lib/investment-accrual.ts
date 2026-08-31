import { and, eq, sql } from "drizzle-orm";
import {
  db,
  investmentsTable,
  transactionsTable,
  usersTable,
} from "@workspace/db";
import { logger } from "./logger";

const DAY_MS = 24 * 60 * 60 * 1000;
const INVESTMENT_DURATION_DAYS = 30;

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function accrueUserInvestments(userId: number) {
  const now = new Date();
  let creditedProfit = 0;
  let releasedCapital = 0;

  await db.transaction(async (tx) => {
    const investments = await tx
      .select()
      .from(investmentsTable)
      .where(and(eq(investmentsTable.userId, userId), eq(investmentsTable.status, "active")));

    for (const investment of investments) {
      const elapsedDays = Math.max(
        0,
        Math.floor((now.getTime() - investment.createdAt.getTime()) / DAY_MS),
      );
      const matured = now.getTime() >= investment.maturesAt.getTime();
      const payableDays = matured
        ? Math.min(investment.durationDays, INVESTMENT_DURATION_DAYS)
        : Math.min(investment.durationDays, elapsedDays, INVESTMENT_DURATION_DAYS);
      const paidDays = investment.profitPaidDays ?? 0;
      const newDays = Math.max(0, payableDays - paidDays);
      const dailyProfit = money((investment.amount * investment.roiPercent) / 100);
      const newProfit = money(dailyProfit * newDays);
      const nextPaidDays = paidDays + newDays;
      const capitalToRelease = matured ? investment.amount : 0;
      const nextStatus = matured ? "matured" : "active";

      if (newDays === 0 && !matured) continue;

      const [updated] = await tx
        .update(investmentsTable)
        .set({
          profitPaidDays: nextPaidDays,
          profitPaid: money((investment.profitPaid ?? 0) + newProfit),
          status: nextStatus,
        })
        .where(
          and(
            eq(investmentsTable.id, investment.id),
            eq(investmentsTable.status, "active"),
            eq(investmentsTable.profitPaidDays, paidDays),
          ),
        )
        .returning();

      if (!updated) continue;

      const totalCredit = money(newProfit + capitalToRelease);
      if (totalCredit > 0) {
        await tx
          .update(usersTable)
          .set({
            balance: sql`${usersTable.balance} + ${totalCredit}`,
            profit: sql`${usersTable.profit} + ${newProfit}`,
          })
          .where(eq(usersTable.id, userId));
      }

      if (newProfit > 0) {
        await tx.insert(transactionsTable).values({
          userId,
          type: "profit",
          amount: newProfit,
          status: "completed",
          description: `${newDays} day${newDays === 1 ? "" : "s"} of profit from ${investment.planName}`,
        });
        creditedProfit += newProfit;
      }

      if (capitalToRelease > 0) {
        await tx.insert(transactionsTable).values({
          userId,
          type: "investment_release",
          amount: capitalToRelease,
          status: "completed",
          description: `Capital released from matured ${investment.planName} investment`,
        });
        releasedCapital += capitalToRelease;
      }
    }
  });

  if (creditedProfit > 0 || releasedCapital > 0) {
    logger.info({ userId, creditedProfit, releasedCapital }, "Investment accrual completed");
  }

  return { creditedProfit, releasedCapital };
}

export async function accrueAllActiveInvestments() {
  const activeRows = await db
    .select({ userId: investmentsTable.userId })
    .from(investmentsTable)
    .where(eq(investmentsTable.status, "active"));
  const userIds = [...new Set(activeRows.map(({ userId }) => userId))];

  for (const userId of userIds) {
    await accrueUserInvestments(userId);
  }

  return userIds.length;
}

export { INVESTMENT_DURATION_DAYS };