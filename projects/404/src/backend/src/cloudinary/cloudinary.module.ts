import { Module } from '@nestjs/common';
import { CloudinaryUploadsController } from './cloudinary.controller';
import { CloudinaryUploadsService } from './cloudinary.service';

@Module({
  controllers: [CloudinaryUploadsController],
  providers: [CloudinaryUploadsService],
  exports: [CloudinaryUploadsService],
})
export class CloudinaryUploadsModule {}
