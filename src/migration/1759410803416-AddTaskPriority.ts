import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskPriority1759410803416 implements MigrationInterface {
  name = 'AddTaskPriority1759410803416';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "priority" integer NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "priority"`);
  }
}
