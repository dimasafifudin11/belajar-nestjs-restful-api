import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
// import { TestModule } from '../test/test.module';
import { TestService } from '../test/test.service';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [CommonModule, UserModule, ContactModule],
  controllers: [],
  providers: [TestService],
})
export class AppModule {}
