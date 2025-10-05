import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';

@Entity('tasks') // 'tasks' - имя таблицы в PostgreSQL
export class Task {
  @PrimaryGeneratedColumn() // Определяет id как первичный ключ с автоинкрементом
  id!: number;

  @Column({ length: 255, nullable: false }) // Обычная колонка, VARCHAR(255)
  title!: string;

  @Column({ type: 'text', nullable: true }) // Колонка типа TEXT
  description!: string;

  @Column({ default: false }) // Колонка типа BOOLEAN, по умолчанию FALSE
  is_done!: boolean;

  @Column({ default: 1 })
  priority!: number;

  @ManyToOne(() => User, (user) => user.tasks, { eager: false })
  user!: User; // Объект пользователя

  @Column() // Фактическая колонка в БД, хранящая ID пользователя
  userId!: number;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
  })
  deleted_at!: Date | null;
}
