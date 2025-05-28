import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Contact, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  ContactResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { Logger } from 'winston';
import { ContactValidation } from './contact.validation';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    req: CreateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.debug(
      `ContactService.create(${JSON.stringify(user)}. ${JSON.stringify(req)})`,
    );
    const createRequest: CreateContactRequest = this.validationService.validate(
      ContactValidation.CREATE,
      req,
    );

    const { username } = user;
    const contact = await this.prismaService.contact.create({
      data: {
        ...createRequest,
        ...{ username },
      },
    });

    return this.toContactResponse(contact);
  }

  toContactResponse(contact: Contact): ContactResponse {
    const { id, first_name, last_name, email, phone } = contact;

    return {
      id,
      first_name,
      last_name,
      email,
      phone,
    };
  }

  async checkContactMustExists(
    username: string,
    contactId: number,
  ): Promise<Contact> {
    const contact = await this.prismaService.contact.findFirst({
      where: { username, id: contactId },
    });

    if (!contact) {
      throw new HttpException('Contact is not found', 404);
    }

    return contact;
  }

  async get(user: User, contactId: number): Promise<ContactResponse> {
    this.logger.debug(
      `ContactService.get(${JSON.stringify(user)}. ${JSON.stringify(contactId)})`,
    );

    const { username } = user;
    const contact = await this.checkContactMustExists(username, contactId);
    return this.toContactResponse(contact);
  }

  async update(
    user: User,
    req: UpdateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.debug(
      `ContactService.update(${JSON.stringify(user)}. ${JSON.stringify(req)})`,
    );

    const updateRequest: UpdateContactRequest = this.validationService.validate(
      ContactValidation.UPDATE,
      req,
    );
    const { username } = user;
    const { id } = updateRequest;
    let contact = await this.checkContactMustExists(username, id);

    contact = await this.prismaService.contact.update({
      where: {
        username: contact.username,
        id: contact.id,
      },
      data: updateRequest,
    });

    return this.toContactResponse(contact);
  }
}
