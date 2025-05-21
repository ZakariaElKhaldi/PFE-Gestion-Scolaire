import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-invoices-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Invoices" (
                "invoiceId" VARCHAR(36) PRIMARY KEY,
                "userId" VARCHAR(36) NOT NULL,
                "paymentId" VARCHAR(36) UNIQUE,
                "amount" DECIMAL(10, 2) NOT NULL,
                "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
                "issueDate" DATE NOT NULL DEFAULT CURRENT_DATE,
                "dueDate" DATE NOT NULL,
                "status" VARCHAR(20) NOT NULL DEFAULT 'draft', -- ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled')
                "pdfUrl" VARCHAR(255),
                "notes" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_invoices_user"
                    FOREIGN KEY ("userId")
                    REFERENCES "Users"("userId")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_invoices_payment"
                    FOREIGN KEY ("paymentId")
                    REFERENCES "Payments"("paymentId")
                    ON DELETE SET NULL
            );
        `);
        // Add ENUM type for status if not directly supported
        // await query(`ALTER TABLE "Invoices" ADD CONSTRAINT "enum_invoices_status" CHECK ("status" IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "status" added to "Invoices" table.`);

        logger.info(`[${migrationName}] Table "Invoices" created successfully or already exists.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Invoices";`);
        logger.info(`[${migrationName}] Table "Invoices" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
