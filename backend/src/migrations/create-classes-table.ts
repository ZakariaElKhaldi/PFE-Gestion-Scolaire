import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-classes-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration to create Classes table with consolidated schema...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Classes" (
                "classId" VARCHAR(36) PRIMARY KEY,
                "courseId" VARCHAR(36) NOT NULL,
                "teacherId" VARCHAR(36),
                "name" VARCHAR(100) NOT NULL,
                "roomNumber" VARCHAR(50),
                "startDate" DATE,
                "endDate" DATE,
                "maxCapacity" INTEGER,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_classes_course"
                    FOREIGN KEY ("courseId")
                    REFERENCES "Courses"("courseId")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_classes_teacher"
                    FOREIGN KEY ("teacherId")
                    REFERENCES "Users"("userId")
                    ON DELETE SET NULL
            );
        `);
        logger.info(`[${migrationName}] Table "Classes" created successfully or already exists with the new schema.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Classes";`);
        logger.info(`[${migrationName}] Table "Classes" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
