import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-parent-student-relationships-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "ParentStudentRelationships" (
                "relationshipId" VARCHAR(36) PRIMARY KEY,
                "parentId" VARCHAR(36) NOT NULL,
                "studentId" VARCHAR(36) NOT NULL,
                "relationshipType" VARCHAR(50) NOT NULL, -- ENUM('Mother', 'Father', 'Guardian', 'Other')
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_psr_parent"
                    FOREIGN KEY ("parentId")
                    REFERENCES "Parents"("parentId")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_psr_student"
                    FOREIGN KEY ("studentId")
                    REFERENCES "Students"("studentId")
                    ON DELETE CASCADE,
                UNIQUE ("parentId", "studentId", "relationshipType") -- Ensures a parent doesn't have the same relationship type twice for the same student
            );
        `);
        // Add ENUM type for relationshipType if not directly supported
        // await query(`ALTER TABLE "ParentStudentRelationships" ADD CONSTRAINT "enum_psr_relationshipType" CHECK ("relationshipType" IN ('Mother', 'Father', 'Guardian', 'Other'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "relationshipType" added to "ParentStudentRelationships" table.`);

        logger.info(`[${migrationName}] Table "ParentStudentRelationships" created successfully or already exists.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "ParentStudentRelationships";`);
        logger.info(`[${migrationName}] Table "ParentStudentRelationships" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
