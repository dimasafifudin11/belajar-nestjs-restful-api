import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { WebResponse } from '../model/web.model';
import {
  ContactResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';

@Controller('/api/contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() req: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const data = await this.contactService.create(user, req);
    return { data };
  }

  @Get('/:contactId')
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<ContactResponse>> {
    const data = await this.contactService.get(user, contactId);
    return { data };
  }

  @Put('/:contactId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() req: UpdateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    req.id = contactId;
    const data = await this.contactService.update(user, req);
    return { data };
  }
}
