import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-materials-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration to create Materials table with consolidated schema...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Materials" (
                "materialId" VARCHAR(36) PRIMARY KEY,
                "courseId" VARCHAR(36) NOT NULL,
                "title" VARCHAR(255) NOT NULL,
                "description" TEXT,
                "type" VARCHAR(20) NOT NULL, -- ENUM('document', 'video', 'quiz', 'assignment', 'link')
                "content" TEXT,
                "filePath" VARCHAR(255),
                "order" INTEGER NOT NULL DEFAULT 0,
                "estimatedDuration" INTEGER,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_materials_course"
                    FOREIGN KEY ("courseId")
                    REFERENCES "Courses"("courseId")
                    ON DELETE CASCADE
            );
        `);
        // Add ENUM type for type if not directly supported
        // await query(`ALTER TABLE "Materials" ADD CONSTRAINT "enum_materials_type" CHECK ("type" IN ('document', 'video', 'quiz', 'assignment', 'link'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "type" added to "Materials" table.`);

        logger.info(`[${migrationName}] Table "Materials" created successfully or already exists with the new schema.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Materials";`);
        logger.info(`[${migrationName}] Table "Materials" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
