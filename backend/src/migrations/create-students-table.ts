import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-students-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Students" (
                "studentId" VARCHAR(36) PRIMARY KEY,
                "userId" VARCHAR(36) NOT NULL UNIQUE,
                "dateOfBirth" DATE,
                "enrollmentDate" DATE NOT NULL DEFAULT CURRENT_DATE,
                "studentIdentifier" VARCHAR(255) UNIQUE,
                "currentGradeLevel" VARCHAR(50),
                "profilePictureUrl" VARCHAR(255),
                "emergencyContactName" VARCHAR(255),
                "emergencyContactPhone" VARCHAR(50),
                "medicalConditions" TEXT,
                "status" VARCHAR(20) NOT NULL DEFAULT 'active', -- ENUM('active', 'inactive', 'graduated', 'dropped_out') - Will alter later if direct ENUM creation is complex
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_students_user"
                    FOREIGN KEY ("userId")
                    REFERENCES "Users"("userId")
                    ON DELETE CASCADE
            );
        `);
        // Add ENUM type for status if not directly supported in CREATE TABLE in this SQL dialect
        // Or handle it via application logic/validation layer if ENUMs are tricky with the query builder
        logger.info(`[${migrationName}] Table "Students" created successfully or already exists.`);

        // Example of adding ENUM type separately if needed (this is generic, adjust to your DB system)
        // await query(`ALTER TABLE "Students" ADD CONSTRAINT "enum_students_status" CHECK ("status" IN ('active', 'inactive', 'graduated', 'dropped_out'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "status" added to "Students" table.`);

        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Students";`);
        logger.info(`[${migrationName}] Table "Students" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
