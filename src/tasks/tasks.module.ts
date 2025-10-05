import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Импортируем TypeOrmModule
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task])], // Указываем, какие сущности будут использоваться в этом модуле
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
