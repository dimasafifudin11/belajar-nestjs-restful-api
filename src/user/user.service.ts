import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from 'src/model/user.model';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest): Promise<UserResponse> {
    this.logger.debug(`Register New User : ${JSON.stringify(req)}`);
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, req);

    const { username, password } = registerRequest;
    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: { username },
    });

    if (totalUserWithSameUsername != 0) {
      throw new HttpException('Username Already Exists', 400);
    }

    registerRequest.password = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(req: LoginUserRequest): Promise<UserResponse> {
    this.logger.debug(`UserService.login(${JSON.stringify(req)})`);
    const loginRequest: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      req,
    );

    const { username, password } = loginRequest;
    let user = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new HttpException('Username or Password is Wrong', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Username or Password is Wrong', 401);
    }

    user = await this.prismaService.user.update({
      where: { username },
      data: {
        token: uuid(),
      },
    });

    return {
      username: user.username,
      name: user.name,
      token: user.token,
    };
  }

  async get(user: User): Promise<UserResponse> {
    const { username, name } = user;
    return {
      username,
      name,
    };
  }

  async update(user: User, req: UpdateUserRequest): Promise<UserResponse> {
    this.logger.debug(
      `UserService.update( ${JSON.stringify(user)} . ${JSON.stringify(req)})  `,
    );
    const updateRequest: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      req,
    );
    const { name, password } = updateRequest;
    const { username } = user;

    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const result = await this.prismaService.user.update({
      where: { username },
      data: user,
    });

    return {
      username: result.username,
      name: result.name,
    };
  }

  async logout(user: User): Promise<UserResponse> {
    const { username } = user;
    const result = await this.prismaService.user.update({
      where: { username },
      data: {
        token: null,
      },
    });

    return {
      username: result.username,
      name: result.name,
    };
  }
}
