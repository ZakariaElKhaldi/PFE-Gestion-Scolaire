import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-course-enrollments-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration to create CourseEnrollments table with consolidated schema...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "CourseEnrollments" (
                "enrollmentId" VARCHAR(36) PRIMARY KEY,
                "studentId" VARCHAR(36) NOT NULL,
                "courseId" VARCHAR(36) NOT NULL,
                "classId" VARCHAR(36),
                "enrollmentDate" DATE NOT NULL DEFAULT CURRENT_DATE,
                "status" VARCHAR(20) NOT NULL DEFAULT 'active', -- ENUM('active', 'completed', 'dropped', 'waitlisted')
                "finalGrade" VARCHAR(10),
                "certificateId" VARCHAR(36) UNIQUE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_enrollments_student"
                    FOREIGN KEY ("studentId")
                    REFERENCES "Students"("studentId") -- Changed from Users(userId) to Students(studentId) for more specificity
                    ON DELETE CASCADE,
                CONSTRAINT "fk_enrollments_course"
                    FOREIGN KEY ("courseId")
                    REFERENCES "Courses"("courseId")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_enrollments_class"
                    FOREIGN KEY ("classId")
                    REFERENCES "Classes"("classId")
                    ON DELETE SET NULL,
                CONSTRAINT "fk_enrollments_certificate"
                    FOREIGN KEY ("certificateId")
                    REFERENCES "Certificates"("certificateId")
                    ON DELETE SET NULL,
                UNIQUE ("studentId", "courseId") -- Ensures a student can only enroll in a course once
            );
        `);
        // Add ENUM type for status if not directly supported
        // await query(`ALTER TABLE "CourseEnrollments" ADD CONSTRAINT "enum_enrollments_status" CHECK ("status" IN ('active', 'completed', 'dropped', 'waitlisted'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "status" added to "CourseEnrollments" table.`);

        logger.info(`[${migrationName}] Table "CourseEnrollments" created successfully or already exists with the new schema.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "CourseEnrollments";`);
        logger.info(`[${migrationName}] Table "CourseEnrollments" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
