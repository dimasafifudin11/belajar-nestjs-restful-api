import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { TestService } from '../test/test.service';
import { ContactModule } from './contact/contact.module';
import { TestModule } from '../test/test.module';

@Module({
  imports: [CommonModule, UserModule, ContactModule, TestModule],
  controllers: [],
  providers: [TestService],
})
export class AppModule {}
