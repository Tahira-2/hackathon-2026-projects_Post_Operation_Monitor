import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  userIds!: string[];
}
