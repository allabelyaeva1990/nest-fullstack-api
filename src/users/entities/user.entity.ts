import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Task } from '../../tasks/entities/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true }) // Email должен быть уникальным
  email!: string;

  @Column({ select: false }) // Важно: не выбирать хеш пароля по умолчанию
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, // По умолчанию обычный пользователь
  })
  role!: UserRole;

  // Отношение One-to-Many: Один пользователь может иметь много задач
  @OneToMany(() => Task, (task) => task.user, {
    lazy: true,
  })
  tasks!: Promise<Task[]>;
}
