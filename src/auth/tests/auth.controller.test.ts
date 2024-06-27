import assert from 'node:assert';
import { describe, it, beforeEach, mock } from 'node:test';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CreateUserDto } from '../../users/dtos/create-user.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  async function signUp(user: CreateUserDto) {
    return {
      // id: '1',
      ...user,
    };
  }

  beforeEach(() => {
    authService = mock.method( signUp,  )
    authController = new AuthController(authService);
  });

  describe('signUp', () => {
    it('should register a new user', async () => {
      const user: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      const result = await authController.signUp(user);

      assert.equal(result.id, '1');
      assert.equal(result.firstName, 'John');
      assert.equal(result.lastName, 'Doe');
      assert.equal(result.email, 'john.doe@example.com');
      assert.notEqual(result.passwordHash, 'password');
    });
  });
});
