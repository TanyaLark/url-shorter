import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1723453074443 implements MigrationInterface {
  name = 'Migration1723453074443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "team" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "icon" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team_users_user" ("teamId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_b15f37b0ce77b1f0bb3e5b98633" PRIMARY KEY ("teamId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e51365666f6e400fe5f85d709a" ON "team_users_user" ("teamId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3645709c5fc6fa1178ebe7f7b9" ON "team_users_user" ("userId") `,
    );
    await queryRunner.query(`ALTER TABLE "url" ADD "teamId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "url" ADD CONSTRAINT "FK_a4e1e0bbbe5f203c363e3913ff3" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_users_user" ADD CONSTRAINT "FK_e51365666f6e400fe5f85d709ab" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_users_user" ADD CONSTRAINT "FK_3645709c5fc6fa1178ebe7f7b9c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "team_users_user" DROP CONSTRAINT "FK_3645709c5fc6fa1178ebe7f7b9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_users_user" DROP CONSTRAINT "FK_e51365666f6e400fe5f85d709ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "url" DROP CONSTRAINT "FK_a4e1e0bbbe5f203c363e3913ff3"`,
    );
    await queryRunner.query(`ALTER TABLE "url" DROP COLUMN "teamId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3645709c5fc6fa1178ebe7f7b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e51365666f6e400fe5f85d709a"`,
    );
    await queryRunner.query(`DROP TABLE "team_users_user"`);
    await queryRunner.query(`DROP TABLE "team"`);
  }
}
