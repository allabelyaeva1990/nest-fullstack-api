import { NotFoundException } from '@nestjs/common';

export class TaskNotFoundException extends NotFoundException {
  constructor(taskId: number) {
    super(`Задача с ID ${taskId} не существует.`);
  }
}
