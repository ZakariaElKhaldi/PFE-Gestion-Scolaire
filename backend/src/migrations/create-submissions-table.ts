import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-submissions-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration to create Submissions table with consolidated schema...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Submissions" (
                "submissionId" VARCHAR(36) PRIMARY KEY,
                "assignmentId" VARCHAR(36) NOT NULL,
                "studentId" VARCHAR(36) NOT NULL,
                "submissionDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "content" TEXT,
                "filePath" VARCHAR(255),
                "grade" DECIMAL(5, 2),
                "feedback" TEXT,
                "status" VARCHAR(20) NOT NULL DEFAULT 'submitted', -- ENUM('submitted', 'late', 'graded', 'resubmitted')
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_submissions_assignment"
                    FOREIGN KEY ("assignmentId")
                    REFERENCES "Assignments"("assignmentId")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_submissions_student"
                    FOREIGN KEY ("studentId")
                    REFERENCES "Students"("studentId") -- Changed from Users(userId) to Students(studentId)
                    ON DELETE CASCADE,
                UNIQUE ("assignmentId", "studentId") -- Ensures a student has one submission per assignment
            );
        `);
        // Add ENUM type for status if not directly supported
        // await query(`ALTER TABLE "Submissions" ADD CONSTRAINT "enum_submissions_status" CHECK ("status" IN ('submitted', 'late', 'graded', 'resubmitted'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "status" added to "Submissions" table.`);

        logger.info(`[${migrationName}] Table "Submissions" created successfully or already exists with the new schema.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Submissions";`);
        logger.info(`[${migrationName}] Table "Submissions" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
