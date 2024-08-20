import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1723797573145 implements MigrationInterface {
  name = 'Migration1723797573145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "UQ_cf461f5b40cf1a2b8876011e1e1"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "UQ_cf461f5b40cf1a2b8876011e1e1" UNIQUE ("name")`,
    );
  }
}
