import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToProducts1775204479172 implements MigrationInterface {
    name = 'AddIsActiveToProducts1775204479172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD "isActive" boolean NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "products"
            DROP COLUMN "isActive"
        `);
    }
}