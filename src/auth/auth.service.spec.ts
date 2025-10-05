import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

// Мокаем bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedPassword', // Хешированный пароль
    role: UserRole.USER,
    tasks: Promise.resolve([]),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
    createWithRole: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    }),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should hash password and create user', async () => {
      const email = 'newuser@example.com';
      const password = 'Password123!';
      const hashedPassword = '$2b$10$hashedPassword';

      // Мокаем bcrypt
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersService.create.mockResolvedValue(mockUser);

      await service.signUp(email, password, UserRole.USER);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 'salt');
      expect(mockUsersService.create).toHaveBeenCalledWith(
        email,
        hashedPassword,
        UserRole.USER,
      );
    });

    it('should pass error from UsersService', async () => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUsersService.create.mockRejectedValue(
        new Error('User already exists'),
      );

      await expect(
        service.signUp('existing@example.com', 'Password123!', UserRole.USER),
      ).rejects.toThrow('User already exists');
    });
  });

  describe('signIn', () => {
    it('should return access and refresh tokens for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';

      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessToken);

      // Мокаем создание refresh token
      mockRefreshTokenRepository.create.mockReturnValue({
        token: 'hashed-refresh-token',
        userId: mockUser.id,
        expiresAt: new Date(),
      });
      mockRefreshTokenRepository.save.mockResolvedValue({});

      const result = await service.signIn(email, password);

      expect(result.accessToken).toBe(accessToken);
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.signIn('wrong@example.com', 'Password123!'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signIn('test@example.com', 'WrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
