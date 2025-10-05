import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToTasks1759424843062 implements MigrationInterface {
  name = 'AddSoftDeleteToTasks1759424843062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "deleted_at"`);
  }
}
