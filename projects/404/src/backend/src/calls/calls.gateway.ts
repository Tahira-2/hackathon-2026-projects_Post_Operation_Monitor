import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { Server, Socket } from 'socket.io';
import { CallsService } from './calls.service';
import type { CallInitiateDto } from './dto/call-initiate.dto';
import type { CallActionDto } from './dto/call-action.dto';
import type { CallSignalDto } from './dto/call-signal.dto';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: { origin: '*' } })
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly socketUsers = new Map<string, JwtPayload>();
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly callsService: CallsService,
    private readonly jwtService: JwtService,
  ) {}

  // ─── Connection Lifecycle ─────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    console.log(`[gateway] connect ${client.id} — token: ${token ? 'present' : 'MISSING'}`);

    if (!token) {
      client.emit('exception', { status: 'error', message: 'Missing auth token' });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'dev-secret',
      });

      this.socketUsers.set(client.id, payload);
      const set = this.userSockets.get(payload.sub) ?? new Set<string>();
      set.add(client.id);
      this.userSockets.set(payload.sub, set);
      console.log(`[gateway] authenticated ${client.id} → user ${payload.sub}`);
    } catch (err) {
      console.error(`[gateway] JWT error for ${client.id}:`, err);
      client.emit('exception', { status: 'error', message: 'Invalid auth token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const payload = this.socketUsers.get(client.id);
    this.socketUsers.delete(client.id);
    console.log(`[gateway] disconnect ${client.id}`);

    if (payload) {
      const sockets = this.userSockets.get(payload.sub);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(payload.sub);
        }
      }
    }
  }

  // ─── Call Events ────────────────────────────────────────────────────────

  @SubscribeMessage('call:initiate')
  async initiateCall(
    @MessageBody() body: CallInitiateDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.getUser(client);
      const { session, calleeUserId } = await this.callsService.initiateCall(
        body.appointmentId,
        user.sub,
      );

      const room = this.roomName(session.id);
      client.join(room);
      console.log(`[gateway] ${client.id} joined room ${room}`);

      const roomSockets = await this.server.in(room).fetchSockets();
      const peerCount = roomSockets.length;
      console.log(`[gateway] room ${room} now has ${peerCount} peer(s)`);

      if (peerCount >= 2) {
        // Deterministically assign who creates the WebRTC offer:
        //   First peer (was already waiting) → shouldOffer: true
        //   Current (just joined as 2nd)     → shouldOffer: false
        const firstPeerSocket = roomSockets.find((s) => s.id !== client.id);
        if (firstPeerSocket) {
          this.server
            .to(firstPeerSocket.id)
            .emit('call:ready', { session, shouldOffer: true });
          console.log(`[gateway] → call:ready(shouldOffer:true) to ${firstPeerSocket.id}`);
        }
        client.emit('call:ready', { session, shouldOffer: false });
        console.log(`[gateway] → call:ready(shouldOffer:false) to ${client.id}`);
      } else {
        // First to arrive — notify the other participant
        this.emitToUser(calleeUserId, 'call:incoming', {
          session,
          callerId: user.sub,
        });
      }

      return { session };
    } catch (err: any) {
      console.error('[gateway] call:initiate error:', err?.message ?? err);
      return { error: err?.message ?? 'Internal error' };
    }
  }

  @SubscribeMessage('call:accept')
  async acceptCall(
    @MessageBody() body: CallActionDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.getUser(client);
      const session = await this.callsService.acceptCall(
        body.callSessionId,
        user.sub,
      );

      const room = this.roomName(session.id);
      client.join(room);
      this.server.to(room).emit('call:accepted', { session });

      return { session };
    } catch (err: any) {
      console.error('[gateway] call:accept error:', err?.message ?? err);
      return { error: err?.message ?? 'Internal error' };
    }
  }

  @SubscribeMessage('call:reject')
  async rejectCall(
    @MessageBody() body: CallActionDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.getUser(client);
      const session = await this.callsService.rejectCall(
        body.callSessionId,
        user.sub,
      );

      const room = this.roomName(session.id);
      this.server.to(room).emit('call:rejected', { session });

      return { session };
    } catch (err: any) {
      console.error('[gateway] call:reject error:', err?.message ?? err);
      return { error: err?.message ?? 'Internal error' };
    }
  }

  @SubscribeMessage('call:end')
  async endCall(
    @MessageBody() body: CallActionDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.getUser(client);
      const session = await this.callsService.endCall(
        body.callSessionId,
        user.sub,
      );

      const room = this.roomName(session.id);
      this.server.to(room).emit('call:ended', { session });

      return { session };
    } catch (err: any) {
      console.error('[gateway] call:end error:', err?.message ?? err);
      return { error: err?.message ?? 'Internal error' };
    }
  }

  // ─── WebRTC Signaling ─────────────────────────────────────────────────────

  @SubscribeMessage('webrtc:offer')
  async sendOffer(
    @MessageBody() body: CallSignalDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.getUser(client);
      const room = this.roomName(body.callSessionId);
      console.log(`[gateway] webrtc:offer from ${client.id} → room ${room}`);
      // broadcast excludes the sender — they must NOT receive their own offer
      client.broadcast
        .to(room)
        .emit('webrtc:offer', { from: user.sub, payload: body.payload });
    } catch (err: any) {
      console.error('[gateway] webrtc:offer error:', err?.message ?? err);
      return { error: err?.message ?? 'Internal error' };
    }
  }

  @SubscribeMessage('webrtc:answer')
  async sendAnswer(
    @MessageBody() body: CallSignalDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.getUser(client);
      const room = this.roomName(body.callSessionId);
      console.log(`[gateway] webrtc:answer from ${client.id} → room ${room}`);
      // broadcast excludes the sender
      client.broadcast
        .to(room)
        .emit('webrtc:answer', { from: user.sub, payload: body.payload });
    } catch (err: any) {
      console.error('[gateway] webrtc:answer error:', err?.message ?? err);
      return { error: err?.message ?? 'Internal error' };
    }
  }

  @SubscribeMessage('webrtc:ice')
  async sendIce(
    @MessageBody() body: CallSignalDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = this.getUser(client);
      const room = this.roomName(body.callSessionId);
      // broadcast excludes the sender
      client.broadcast
        .to(room)
        .emit('webrtc:ice', { from: user.sub, payload: body.payload });
    } catch (err: any) {
      return { error: err?.message ?? 'Internal error' };
    }
  }


  // ─── Captions ─────────────────────────────────────────────────────────────

  broadcastCaption(callSessionId: string, speaker: string, text: string) {
    const room = this.roomName(callSessionId);
    this.server.to(room).emit('transcript:caption', { speaker, text });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private extractToken(client: Socket): string | undefined {
    // 1. socket.io auth object: io(url, { auth: { token } })
    const authToken = client.handshake.auth?.token;
    if (authToken) return String(authToken);

    // 2. Authorization header: Bearer <token>
    const header = client.handshake.headers?.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice(7);
    }

    // 3. Query param: ?token=<token>  (fallback for some proxy setups)
    const queryToken = client.handshake.query?.token;
    if (queryToken) return String(queryToken);

    return undefined;
  }

  private getUser(client: Socket): JwtPayload {
    const user = this.socketUsers.get(client.id);
    if (!user) {
      throw new Error('Unauthorized');
    }
    return user;
  }

  private emitToUser(userId: string, event: string, payload: unknown) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    for (const socketId of sockets) {
      this.server.to(socketId).emit(event, payload);
    }
  }

  private roomName(callSessionId: string) {
    return `call:${callSessionId}`;
  }
}
