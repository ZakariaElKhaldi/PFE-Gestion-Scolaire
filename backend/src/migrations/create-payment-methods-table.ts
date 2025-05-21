import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-payment-methods-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "PaymentMethods" (
                "paymentMethodId" VARCHAR(36) PRIMARY KEY,
                "userId" VARCHAR(36) NOT NULL,
                "methodType" VARCHAR(20) NOT NULL, -- ENUM('card', 'bank_transfer', 'paypal', 'other')
                "cardBrand" VARCHAR(50),
                "lastFourDigits" VARCHAR(4),
                "expiryMonth" VARCHAR(2),
                "expiryYear" VARCHAR(4),
                "isDefault" BOOLEAN NOT NULL DEFAULT false,
                "gatewayToken" VARCHAR(255),
                "gatewayType" VARCHAR(20), -- ENUM('stripe', 'paypal', 'other')
                "billingDetails" JSON,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_paymentmethods_user"
                    FOREIGN KEY ("userId")
                    REFERENCES "Users"("userId")
                    ON DELETE CASCADE
            );
        `);
        // Add ENUM types if not directly supported
        // await query(`ALTER TABLE "PaymentMethods" ADD CONSTRAINT "enum_paymentmethods_methodtype" CHECK ("methodType" IN ('card', 'bank_transfer', 'paypal', 'other'));`);
        // await query(`ALTER TABLE "PaymentMethods" ADD CONSTRAINT "enum_paymentmethods_gatewaytype" CHECK ("gatewayType" IN ('stripe', 'paypal', 'other'));`);
        // logger.info(`[${migrationName}] ENUM constraints added to "PaymentMethods" table.`);

        logger.info(`[${migrationName}] Table "PaymentMethods" created successfully or already exists.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "PaymentMethods";`);
        logger.info(`[${migrationName}] Table "PaymentMethods" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
