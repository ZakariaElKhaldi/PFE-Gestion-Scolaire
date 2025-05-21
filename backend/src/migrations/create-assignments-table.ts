import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-assignments-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration to create Assignments table with consolidated schema...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Assignments" (
                "assignmentId" VARCHAR(36) PRIMARY KEY,
                "courseId" VARCHAR(36) NOT NULL,
                "classId" VARCHAR(36),
                "title" VARCHAR(255) NOT NULL,
                "description" TEXT,
                "dueDate" TIMESTAMP,
                "maxPoints" INTEGER DEFAULT 100,
                "type" VARCHAR(20) NOT NULL DEFAULT 'homework', -- ENUM('homework', 'quiz', 'exam', 'project', 'other')
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_assignments_course"
                    FOREIGN KEY ("courseId")
                    REFERENCES "Courses"("courseId")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_assignments_class"
                    FOREIGN KEY ("classId")
                    REFERENCES "Classes"("classId")
                    ON DELETE SET NULL
            );
        `);
        // Add ENUM type for type if not directly supported
        // await query(`ALTER TABLE "Assignments" ADD CONSTRAINT "enum_assignments_type" CHECK ("type" IN ('homework', 'quiz', 'exam', 'project', 'other'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "type" added to "Assignments" table.`);

        logger.info(`[${migrationName}] Table "Assignments" created successfully or already exists with the new schema.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Assignments";`);
        logger.info(`[${migrationName}] Table "Assignments" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
