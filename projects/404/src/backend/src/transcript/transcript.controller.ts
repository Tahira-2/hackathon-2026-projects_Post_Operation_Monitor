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

  /** TEST ONLY: Manually add text to transcript (no STT needed) */
  @Post(':callSessionId/test-text')
  addTestText(
    @Param('callSessionId') callSessionId: string,
    @Body() body: { speaker: string; content: string },
  ) {
    return this.transcriptService.saveTranscriptChunk(callSessionId, body.speaker, body.content);
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

  /** Mark medications as applied/confirmed */
  @Post(':callSessionId/apply-medications')
  applyMedications(@Param('callSessionId') callSessionId: string) {
    return this.transcriptService.applyMedications(callSessionId);
  }

  /** Get all history for a patient */
  @Get('history/:patientId')
  getHistory(@Param('patientId') patientId: string) {
    return this.transcriptService.getPatientHistory(patientId);
  }
}
