import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-payments-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Payments" (
                "paymentId" VARCHAR(36) PRIMARY KEY,
                "userId" VARCHAR(36) NOT NULL,
                "courseId" VARCHAR(36),
                "amount" DECIMAL(10, 2) NOT NULL,
                "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
                "paymentDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "status" VARCHAR(20) NOT NULL DEFAULT 'pending', -- ENUM('pending', 'succeeded', 'failed', 'refunded')
                "paymentMethodId" VARCHAR(36),
                "transactionId" VARCHAR(255) UNIQUE,
                "notes" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_payments_user"
                    FOREIGN KEY ("userId")
                    REFERENCES "Users"("userId")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_payments_course"
                    FOREIGN KEY ("courseId")
                    REFERENCES "Courses"("courseId")
                    ON DELETE SET NULL,
                CONSTRAINT "fk_payments_paymentmethod"
                    FOREIGN KEY ("paymentMethodId")
                    REFERENCES "PaymentMethods"("paymentMethodId")
                    ON DELETE SET NULL
            );
        `);
        // Add ENUM type for status if not directly supported
        // await query(`ALTER TABLE "Payments" ADD CONSTRAINT "enum_payments_status" CHECK ("status" IN ('pending', 'succeeded', 'failed', 'refunded'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "status" added to "Payments" table.`);

        logger.info(`[${migrationName}] Table "Payments" created successfully or already exists.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Payments";`);
        logger.info(`[${migrationName}] Table "Payments" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
