import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-certificates-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Certificates" (
                "certificateId" VARCHAR(36) PRIMARY KEY,
                "userId" VARCHAR(36) NOT NULL,
                "courseId" VARCHAR(36),
                "title" VARCHAR(255) NOT NULL,
                "issueDate" DATE NOT NULL DEFAULT CURRENT_DATE,
                "expiryDate" DATE,
                "pdfUrl" VARCHAR(255),
                "qrCodeUrl" VARCHAR(255),
                "notes" TEXT,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_certificates_user"
                    FOREIGN KEY ("userId")
                    REFERENCES "Users"("userId")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_certificates_course"
                    FOREIGN KEY ("courseId")
                    REFERENCES "Courses"("courseId")
                    ON DELETE SET NULL
            );
        `);
        logger.info(`[${migrationName}] Table "Certificates" created successfully or already exists.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Certificates";`);
        logger.info(`[${migrationName}] Table "Certificates" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
