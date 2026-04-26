import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TranscriptService } from './transcript.service';
import { SaveChunkDto } from './dto/save-chunk.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('transcript')
@UseGuards(JwtAuthGuard)
export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  /** Receive an audio chunk, run STT, save to DB */
  @Post(':callSessionId/chunk')
  saveChunk(
    @Param('callSessionId') callSessionId: string,
    @Body() dto: SaveChunkDto,
  ) {
    return this.transcriptService.saveChunk(callSessionId, dto.speaker, dto.audioBase64);
  }

  /** Get all transcript chunks for a session */
  @Get(':callSessionId')
  getTranscript(@Param('callSessionId') callSessionId: string) {
    return this.transcriptService.getTranscript(callSessionId);
  }

  /** Generate & save Gemini summary for a session */
  @Post(':callSessionId/summary')
  generateSummary(@Param('callSessionId') callSessionId: string) {
    return this.transcriptService.generateSummary(callSessionId);
  }

  /** Get existing summary */
  @Get(':callSessionId/summary')
  getSummary(@Param('callSessionId') callSessionId: string) {
    return this.transcriptService.getSummary(callSessionId);
  }
}
