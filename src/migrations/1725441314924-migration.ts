import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1725441314924 implements MigrationInterface {
  name = 'Migration1725441314924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "url" DROP CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "url" ADD CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "url" DROP CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "url" ADD CONSTRAINT "FK_2919f59acab0f44b9a244d35bdb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
