import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-courses-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration to create Courses table with consolidated schema...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Courses" (
                "courseId" VARCHAR(36) PRIMARY KEY,
                "name" VARCHAR(255) NOT NULL,
                "description" TEXT,
                "credits" INTEGER NOT NULL DEFAULT 1,
                "departmentId" VARCHAR(36),
                "teacherId" VARCHAR(36),
                "startDate" DATE,
                "endDate" DATE,
                "maxStudents" INTEGER NOT NULL DEFAULT 30,
                "status" VARCHAR(20) NOT NULL DEFAULT 'upcoming', -- ENUM('active', 'upcoming', 'completed')
                "subjectId" VARCHAR(36),
                "levelId" VARCHAR(36),
                "programId" VARCHAR(36),
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_courses_department"
                    FOREIGN KEY ("departmentId")
                    REFERENCES "Departments"("departmentId")
                    ON DELETE SET NULL,
                CONSTRAINT "fk_courses_teacher"
                    FOREIGN KEY ("teacherId")
                    REFERENCES "Users"("userId")
                    ON DELETE SET NULL,
                CONSTRAINT "fk_courses_subject"
                    FOREIGN KEY ("subjectId")
                    REFERENCES "Subjects"("subjectId")
                    ON DELETE SET NULL,
                CONSTRAINT "fk_courses_level"
                    FOREIGN KEY ("levelId")
                    REFERENCES "Levels"("levelId")
                    ON DELETE SET NULL,
                CONSTRAINT "fk_courses_program"
                    FOREIGN KEY ("programId")
                    REFERENCES "Programs"("programId")
                    ON DELETE SET NULL
            );
        `);
        // Add ENUM type for status if not directly supported
        // await query(`ALTER TABLE "Courses" ADD CONSTRAINT "enum_courses_status" CHECK ("status" IN ('active', 'upcoming', 'completed'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "status" added to "Courses" table.`);

        logger.info(`[${migrationName}] Table "Courses" created successfully or already exists with the new schema.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Courses";`);
        logger.info(`[${migrationName}] Table "Courses" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
