import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-users-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration to create Users table with consolidated schema...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Users" (
                "userId" VARCHAR(36) PRIMARY KEY,
                "email" VARCHAR(255) NOT NULL UNIQUE,
                "password" VARCHAR(255) NOT NULL,
                "firstName" VARCHAR(100) NOT NULL,
                "lastName" VARCHAR(100) NOT NULL,
                "role" VARCHAR(20) NOT NULL, -- ENUM('administrator', 'teacher', 'student', 'parent')
                "profilePictureUrl" VARCHAR(255),
                "phoneNumber" VARCHAR(50),
                "lastLogin" TIMESTAMP,
                "isActive" BOOLEAN NOT NULL DEFAULT true,
                "isVerified" BOOLEAN NOT NULL DEFAULT false,
                "verificationToken" VARCHAR(255),
                "resetPasswordToken" VARCHAR(255),
                "resetPasswordExpires" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP
            );
        `);
        // Add ENUM type for role if not directly supported
        // await query(`ALTER TABLE "Users" ADD CONSTRAINT "enum_users_role" CHECK ("role" IN ('administrator', 'teacher', 'student', 'parent'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "role" added to "Users" table.`);

        logger.info(`[${migrationName}] Table "Users" created successfully or already exists with the new schema.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        // This will drop the new table. Data migration from the -legacy table would be a separate process.
        await query(`DROP TABLE IF EXISTS "Users";`);
        logger.info(`[${migrationName}] Table "Users" dropped successfully.`);
        // Optionally, here you could rename "create-users-table-legacy.ts" back if that's part of the rollback strategy,
        // but typically migrations don't handle renaming other migration files.
        logger.info(`[${migrationName}] Reversion completed successfully. The -legacy table schema is not automatically restored by this down migration.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
