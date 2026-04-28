import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type, Tool } from '@google/genai';
import { WeekDay, BlockType, AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { MedicineService } from '../medicine/medicine.service';
import { SpecializationsService } from '../specializations/specializations.service';
import { UsersService } from '../users/users.service';
import { AppointmentService } from '../appointment/appointment.service';
import { AvailabilityService } from '../availability/availability.service';

export interface DoctorSuggestion {
  doctorId: string;
  doctorName: string;
  specialization: string;
  workingHours: { day: string; startTime: string; endTime: string }[];
}

export interface McpCompletionResponse {
  aiContent: string;
  doctorSuggestions: DoctorSuggestion[];
  actions?: any[];
}

@Injectable()
export class McpService {
  private readonly geminiModel = 'gemini-2.5-flash';
  private readonly geminiApiKey =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENAI_API_KEY ??
    process.env.GOOGLE_API_KEY;
  private readonly geminiClient = this.geminiApiKey
    ? new GoogleGenAI({ apiKey: this.geminiApiKey })
    : null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly medicineService: MedicineService,
    private readonly specializationsService: SpecializationsService,
    private readonly usersService: UsersService,
    private readonly appointmentService: AppointmentService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async generateAiReply(
    userId: string,
    conversationId: string,
    latestMessage: string,
    history: any[],
  ): Promise<McpCompletionResponse> {
    if (!this.geminiClient) {
      return {
        aiContent: 'AI capabilities are currently unavailable (API key not configured).',
        doctorSuggestions: [],
        actions: [],
      };
    }

    const [profile, allDoctors, systemStats] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, fullName: true, role: true },
      }),
      this.fetchAvailableDoctors(),
      this.getSystemStats(),
    ]);

    const doctorsContext = allDoctors
      .map(
        (d) =>
          `- ${d.doctorName} (${d.specialization}) [ID: ${d.doctorId}]: available ${d.workingHours.map((wh) => `${wh.day} ${wh.startTime}-${wh.endTime}`).join(', ')}`,
      )
      .join('\n');

    const isAdmin = profile?.role === 'ADMIN';
    const isDoctor = profile?.role === 'DOCTOR';

    const roleContext = isAdmin
      ? [
          'The user is an ADMIN on the HealthCore platform.',
          'You are their system AI assistant. You can query AND mutate system data.',
        ]
      : isDoctor
      ? [
          'The user is a DOCTOR on the HealthCore platform.',
          'You are their clinical AI assistant.',
        ]
      : [
          'The user is a PATIENT on the HealthCore platform.',
          'You are their friendly healthcare assistant. Never diagnose.',
        ];

    const prompt = [
      'You are HealthCore AI, a professional healthcare assistant for a telemedicine platform.',
      ...roleContext,
      '',
      `User profile: ${JSON.stringify(profile ?? { id: userId })}`,
      `System stats: ${JSON.stringify(systemStats)}`,
      `Available doctors:\n${doctorsContext || 'None registered yet'}`,
      `Conversation history: ${JSON.stringify(history.slice(-10))}`,
      `Latest message: ${latestMessage}`,
      '',
      'Use the provided tools/functions to perform actions or queries as requested by the user. CRITICAL INSTRUCTION: If the user asks a question about subset data (e.g., appointments tomorrow, specific doctors), YOU MUST STILL execute the general QUERY function (e.g., QUERY_APPOINTMENTS) to fetch the raw data so you can filter it. Treat general queries as your dynamic database to resolve specific natural questions.',
    ].join('\n');

    // ── NATIVE FUNCTION DECLARATIONS ──
    const tools: Tool[] = [{
      functionDeclarations: [
        { name: 'QUERY_USERS', description: 'Get all users and system stats' },
        { name: 'QUERY_DOCTORS', description: 'Get all doctors' },
        { name: 'QUERY_APPOINTMENTS', description: 'Get all appointments' },
        { name: 'QUERY_MEDICINES', description: 'Get all medicines' },
        { name: 'QUERY_SPECIALIZATIONS', description: 'Get all specializations' },
        {
          name: 'ADD_USER',
          description: 'Add a new user',
          parameters: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              email: { type: Type.STRING },
              password: { type: Type.STRING },
              role: { type: Type.STRING, description: 'ADMIN, DOCTOR, or PATIENT' },
              specializationName: { type: Type.STRING, description: 'Optional. Only for doctors.' }
            },
            required: ['fullName', 'email', 'password', 'role']
          }
        },
        {
          name: 'ADD_MEDICINE',
          description: 'Add a new medicine',
          parameters: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              form: { type: Type.STRING, description: 'TABLET, CAPSULE, SYRUP, or INJECTION' },
              description: { type: Type.STRING },
              manufacturer: { type: Type.STRING },
              category: { type: Type.STRING, description: 'OTC or PRESCRIPTION' }
            },
            required: ['name', 'form', 'category']
          }
        },
        {
          name: 'ADD_SPECIALIZATION',
          description: 'Add a new specialization',
          parameters: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['name']
          }
        },
        {
          name: 'BOOK_APPOINTMENT',
          description: 'Book an appointment with a doctor',
          parameters: {
            type: Type.OBJECT,
            properties: {
              doctorId: { type: Type.STRING },
              startTime: { type: Type.STRING, description: 'ISO string' },
              endTime: { type: Type.STRING, description: 'ISO string' },
              reason: { type: Type.STRING }
            },
            required: ['doctorId', 'startTime', 'endTime']
          }
        }
      ]
    }];

    try {
      const response = await this.geminiClient.models.generateContent({
        model: this.geminiModel,
        contents: prompt,
        config: { tools }
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const functionCalls = parts.filter(p => p.functionCall).map(p => p.functionCall);
      const rawText = parts.filter(p => p.text).map(p => p.text).join(' ').trim();

      if (functionCalls.length > 0) {
        const processedActions = await Promise.all(
          functionCalls.map(async fc => {
            const name = fc?.name ?? '';
            const args = fc?.args ?? {};
            let paramString = '';
            
            
            if (name === 'ADD_USER') paramString = `${args.fullName}|${args.email}|${args.password}|${args.role}|${args.specializationName || ''}`;
            else if (name === 'ADD_MEDICINE') paramString = `${args.name}|${args.form}|${args.description || ''}|${args.manufacturer || ''}|${args.category}`;
            else if (name === 'ADD_SPECIALIZATION') paramString = `${args.name}|${args.description || ''}`;
            else if (name === 'BOOK_APPOINTMENT') paramString = `${args.doctorId}|${args.startTime}|${args.endTime}|${args.reason || ''}`;
            
            const actionStr = paramString ? `${name}:${paramString}` : name;
            return this.processAction(actionStr, userId);
          })
        );

        let aiContent = rawText || 'I have executed your request.';
        const queryResults = processedActions.filter(a => a?.isQuery);
        if (queryResults.length > 0) {
          const queryData = queryResults.map(q => JSON.stringify(q.data)).join('\n\n');
          try {
            const formatPrompt = `You are HealthCore AI. The user asked: "${latestMessage}".\nYou executed a database query and received this raw JSON result:\n${queryData}\n\nPlease provide a polite, natural language answer summarizing this data. Do not include raw JSON or code blocks. Speak directly to the user.`;
            const formatResponse = await this.geminiClient.models.generateContent({
              model: this.geminiModel,
              contents: formatPrompt,
            });
            aiContent = formatResponse.text || aiContent;
          } catch (e) {
            aiContent += '\n\n**Data Result:**\n```json\n' + queryData + '\n```';
          }
        }

        return {
          aiContent,
          doctorSuggestions: [],
          actions: processedActions.filter(a => !a?.isQuery),
        };
      }

      return {
        aiContent: rawText || 'Got it.',
        doctorSuggestions: [],
        actions: [],
      };
    } catch (e: any) {
      console.error(e);
      const fallback = await this.handleKeywordFallback(latestMessage, userId, systemStats);
      return {
        ...fallback,
        aiContent: `**System Debug Error**: ${e?.message || JSON.stringify(e)}\n\n---\n\n${fallback.aiContent}`,
      };
    }
  }

  private async handleKeywordFallback(
    message: string,
    userId: string,
    systemStats: Record<string, number>,
  ): Promise<McpCompletionResponse> {
    const msg = message.toLowerCase();
    const hasAny = (words: string[]) => words.some(w => msg.includes(w));

    const isUserQuery =
      hasAny(['user', 'member', 'people', 'person', 'registered']) &&
      hasAny(['list', 'show', 'name', 'all', 'get', 'who', 'how many', 'count', 'total', 'give me', 'tell me', 'display']);

    if (isUserQuery) {
      const result = await this.processAction('QUERY_USERS', userId);
      const stats = result?.data || systemStats;
      const users = ((result?.data?.users || []) as any[]).slice(0, 20);
      const userList = users.length
        ? users.map((u: any) => `- **${u.fullName}** (${u.role}) — ${u.email}`).join('\n')
        : 'No users yet.';
      return {
        aiContent: `**HealthCore System Users — ${stats.totalUsers ?? systemStats.totalUsers} Total**\n\nBreakdown:\n- Admins: ${stats.totalAdmins ?? 0}\n- Doctors: ${stats.totalDoctors ?? systemStats.totalDoctors}\n- Patients: ${stats.totalPatients ?? systemStats.totalPatients}\n\n${userList}`,
        doctorSuggestions: [],
        actions: [],
      };
    }

    const isDoctorQuery =
      hasAny(['doctor', 'physician', 'specialist']) &&
      hasAny(['list', 'show', 'name', 'all', 'get', 'who', 'how many', 'count', 'available', 'display', 'give me', 'tell me']);

    if (isDoctorQuery) {
      const doctors = await this.fetchAvailableDoctors();
      const list = doctors.length
        ? doctors.map(d =>
            `- **${d.doctorName}** — ${d.specialization}` +
            (d.workingHours.length
              ? ' | ' + d.workingHours.slice(0, 2).map(wh => `${wh.day} ${wh.startTime}-${wh.endTime}`).join(', ')
              : '')
          ).join('\n')
        : 'No doctors registered yet.';
      return {
        aiContent: `**Available Doctors (${doctors.length} total)**\n\n${list}`,
        doctorSuggestions: doctors,
        actions: [],
      };
    }

    const isApptQuery =
      hasAny(['appointment', 'booking', 'schedule', 'scheduled']) &&
      hasAny(['list', 'show', 'name', 'all', 'get', 'how many', 'count', 'display', 'give me', 'tell me', 'recent']);

    if (isApptQuery) {
      const result = await this.processAction('QUERY_APPOINTMENTS', userId);
      const appts = ((result?.data?.appointments || []) as any[]).slice(0, 10);
      const list = appts.length
        ? appts.map(a =>
            `- **Dr. ${a.doctor?.user?.fullName || 'Unknown'}** with **${a.patient?.user?.fullName || 'Unknown'}**\n  ${new Date(a.startTime).toLocaleString()} [${a.status}]` +
            (a.reason ? ' — ' + a.reason : '')
          ).join('\n')
        : 'No appointments found.';
      return {
        aiContent: `**Appointments (${result?.data?.total || 0} total)**\n\n${list}`,
        doctorSuggestions: [],
        actions: [],
      };
    }

    const isSpecQuery =
      hasAny(['specialization', 'speciality', 'specialty', 'department']) &&
      hasAny(['list', 'show', 'name', 'all', 'get', 'how many', 'count', 'display', 'give me', 'tell me', 'available']);

    if (isSpecQuery && !hasAny(['add', 'create', 'insert', 'new'])) {
      const result = await this.processAction('QUERY_SPECIALIZATIONS', userId);
      const specs = (result?.data?.specializations || []) as any[];
      const list = specs.length
        ? specs.map(s => `- **${s.name}**${s.description ? ': ' + s.description : ''}`).join('\n')
        : 'No specializations found.';
      return {
        aiContent: `**Specializations (${specs.length} total)**\n\n${list}`,
        doctorSuggestions: [],
        actions: [],
      };
    }

    const isMedQuery =
      hasAny(['medicine', 'drug', 'medication', 'pharmaceutical']) &&
      hasAny(['list', 'show', 'name', 'all', 'get', 'how many', 'count', 'display', 'give me', 'tell me', 'available']);

    if (isMedQuery && !hasAny(['add', 'create', 'insert', 'new'])) {
      const result = await this.processAction('QUERY_MEDICINES', userId);
      const meds = ((result?.data?.medicines || []) as any[]).slice(0, 15);
      const list = meds.length
        ? meds.map(m => `- **${m.name}** (${m.form})${m.category ? ' — ' + m.category : ''}${m.description ? ': ' + m.description : ''}`).join('\n')
        : 'No medicines registered.';
      return {
        aiContent: `**Medicines (${result?.data?.total || 0} total)**\n\n${list}`,
        doctorSuggestions: [],
        actions: [],
      };
    }

    if (hasAny(['stats', 'statistics', 'overview', 'summary', 'dashboard'])) {
      const { totalUsers, totalDoctors, totalPatients, totalAppointments, totalMedicines } = systemStats;
      return {
        aiContent: `**HealthCore System Overview**\n\n- 👥 Total Users: **${totalUsers}**\n- 🩺 Doctors: **${totalDoctors}**\n- 🧑 Patients: **${totalPatients}**\n- 📅 Appointments: **${totalAppointments}**\n- 💊 Medicines: **${totalMedicines}**`,
        doctorSuggestions: [],
        actions: [],
      };
    }

    const addSpecMatch = message.match(
      /(?:add|create|new|insert)\s+(?:a\s+|new\s+)?specializ[a-z]+\s+(?:called\s+|named\s+|with\s+name\s+)?([A-Za-z0-9 ]+?)(?:\s+with\s+description\s+(.+?))?\.?\s*$/i,
    );
    if (addSpecMatch) {
      const name = addSpecMatch[1].trim();
      const description = addSpecMatch[2]?.trim();
      try {
        const result = await this.specializationsService.create({ name, description });
        return {
          aiContent: `✅ Specialization **${result.name}** added successfully!${description ? '\nDescription: ' + description : ''}`,
          doctorSuggestions: [],
          actions: [result],
        };
      } catch (e: any) {
        return {
          aiContent: `❌ Failed to add specialization: ${(e as Error).message}`,
          doctorSuggestions: [],
          actions: [],
        };
      }
    }

    const addMedMatch = message.match(
      /(?:add|create|new|insert)\s+(?:a\s+|new\s+)?(?:medicine|drug|medication)\s+(?:called\s+|named\s+)?([A-Za-z0-9 ]+?)(?:\s+form\s+(\w+))?(?:\s+category\s+(\w+))?\.?\s*$/i,
    );
    if (addMedMatch) {
      const name = addMedMatch[1].trim();
      const form = (addMedMatch[2]?.toUpperCase() ?? 'TABLET') as any;
      const category = (addMedMatch[3]?.toUpperCase() ?? 'OTC') as any;
      try {
        const result = await this.medicineService.create({ name, form, category });
        return {
          aiContent: `✅ Medicine **${name}** (${form}) added successfully!`,
          doctorSuggestions: [],
          actions: [result],
        };
      } catch (e: any) {
        return {
          aiContent: `❌ Failed to add medicine: ${(e as Error).message}`,
          doctorSuggestions: [],
          actions: [],
        };
      }
    }

    const addUserMatch = message.match(
      /(?:add|create|register|new)\s+(?:a\s+|new\s+)?(?:user|doctor|patient|admin)\s+(?:named\s+|called\s+|name\s+)?([A-Za-z ]+?)\s+(?:with\s+)?email\s+(\S+)\s+(?:and\s+)?password\s+(\S+)(?:\s+role\s+(\w+))?(?:\s+specialization\s+(.+?))?\.?\s*$/i,
    );
    if (addUserMatch) {
      const fullName = addUserMatch[1].trim();
      const email = addUserMatch[2].trim();
      const password = addUserMatch[3].trim();
      const role = (addUserMatch[4]?.toUpperCase() ?? 'PATIENT') as any;
      const specializationName = addUserMatch[5]?.trim();
      try {
        const result = await this.usersService.create({ fullName, email, password, role, specializationName });
        return {
          aiContent: `✅ User **${fullName}** (${role}) registered with email ${email}!`,
          doctorSuggestions: [],
          actions: [{ id: (result as any).id, fullName, role, email }],
        };
      } catch (e: any) {
        return {
          aiContent: `❌ Failed to create user: ${(e as Error).message}`,
          doctorSuggestions: [],
          actions: [],
        };
      }
    }

    const bookMatch = message.match(
      /book\s+appointment\s+(?:with\s+doctor\s+(?:id\s+)?)?(\S+)\s+(?:from|start(?:ing)?)\s+(.+?)\s+(?:to|end(?:ing)?|until)\s+(.+?)(?:\s+reason\s+(.+?))?\.?\s*$/i,
    );
    if (bookMatch) {
      const doctorId = bookMatch[1].trim();
      const startTime = bookMatch[2].trim();
      const endTime = bookMatch[3].trim();
      const reason = bookMatch[4]?.trim() ?? 'General consultation';
      try {
        const result = await this.processAction(
          `BOOK_APPOINTMENT:${doctorId}|${startTime}|${endTime}|${reason}`,
          userId,
        );
        if (result?.error) throw new Error(result.error);
        return {
          aiContent: `✅ Appointment booked from ${startTime} to ${endTime}!`,
          doctorSuggestions: [],
          actions: [result],
        };
      } catch (e: any) {
        return {
          aiContent: `❌ Failed to book appointment: ${(e as Error).message}`,
          doctorSuggestions: [],
          actions: [],
        };
      }
    }

    const { totalUsers, totalDoctors, totalPatients, totalAppointments, totalMedicines } = systemStats;
    return {
      aiContent: `Here's what I can help you with:\n\n**📊 Queries — ask naturally:**\n- "name all users" / "list all doctors" / "show appointments"\n- "how many users are registered?" / "list medicines" / "show specializations"\n\n**⚙️ Actions:**\n- "add specialization [name] with description [desc]"\n- "add medicine [name] form [TABLET] category [OTC]"\n- "add user [name] email [email] password [pass] role [PATIENT/DOCTOR/ADMIN]"\n- "book appointment [doctorId] from [startTime] to [endTime]"\n\n**📈 Current Stats:** ${totalUsers} users | ${totalDoctors} doctors | ${totalPatients} patients | ${totalAppointments} appointments | ${totalMedicines} medicines`,
      doctorSuggestions: [],
      actions: [],
    };
  }

  private async getSystemStats(): Promise<Record<string, number>> {
    const [totalUsers, totalDoctors, totalPatients, totalAppointments, totalMedicines] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.doctor.count(),
      this.prisma.patient.count(),
      this.prisma.appointment.count(),
      this.prisma.medicine.count(),
    ]);
    return { totalUsers, totalDoctors, totalPatients, totalAppointments, totalMedicines };
  }

  async fetchAvailableDoctors(specializationKeyword?: string): Promise<DoctorSuggestion[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: specializationKeyword
        ? { specialization: { name: { contains: specializationKeyword, mode: 'insensitive' } } }
        : undefined,
      select: {
        id: true,
        user: { select: { fullName: true } },
        specialization: { select: { name: true } },
        workingHours: { select: { day: true, startTime: true, endTime: true }, orderBy: { day: 'asc' } },
      },
      take: 10,
    });

    return doctors.map(d => ({
      doctorId: d.id,
      doctorName: d.user.fullName,
      specialization: d.specialization.name,
      workingHours: d.workingHours.map(wh => ({
        day: wh.day,
        startTime: wh.startTime,
        endTime: wh.endTime,
      })),
    }));
  }

  private async processAction(actionStr: string, requestedByUserId: string): Promise<any> {
    const colonIdx = actionStr.indexOf(':');
    const action = colonIdx >= 0 ? actionStr.substring(0, colonIdx) : actionStr;
    const paramsStr = colonIdx >= 0 ? actionStr.substring(colonIdx + 1) : '';
    const params = paramsStr ? paramsStr.split('|').map(p => p.trim()) : [];

    try {
      switch (action) {
        case 'QUERY_USERS': {
          const [users, totalUsers, totalDoctors, totalPatients, totalAdmins] = await Promise.all([
            this.prisma.user.findMany({
              select: { id: true, fullName: true, email: true, role: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
              take: 20,
            }),
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'DOCTOR' } }),
            this.prisma.user.count({ where: { role: 'PATIENT' } }),
            this.prisma.user.count({ where: { role: 'ADMIN' } }),
          ]);
          return { isQuery: true, data: { totalUsers, totalDoctors, totalPatients, totalAdmins, users } };
        }
        case 'QUERY_DOCTORS': {
          const doctors = await this.fetchAvailableDoctors();
          return { isQuery: true, data: { total: doctors.length, doctors } };
        }
        case 'QUERY_APPOINTMENTS': {
          const appointments = await this.prisma.appointment.findMany({
            select: {
              id: true,
              startTime: true,
              endTime: true,
              status: true,
              reason: true,
              doctor: { select: { user: { select: { fullName: true } } } },
              patient: { select: { user: { select: { fullName: true } } } },
            },
            orderBy: { startTime: 'desc' },
            take: 20,
          });
          return { isQuery: true, data: { total: appointments.length, appointments } };
        }
        case 'QUERY_MEDICINES': {
          const medicines = await this.prisma.medicine.findMany({ orderBy: { name: 'asc' }, take: 50 });
          return { isQuery: true, data: { total: medicines.length, medicines } };
        }
        case 'QUERY_SPECIALIZATIONS': {
          const specializations = await this.prisma.specialization.findMany({ orderBy: { name: 'asc' } });
          return { isQuery: true, data: { total: specializations.length, specializations } };
        }
        case 'ADD_USER': {
          const [fullName, email, password, role, specializationName] = params;
          return await this.usersService.create({ fullName, email, password, role: role as any, specializationName });
        }
        case 'DELETE_USER': {
          const [userId] = params;
          return await this.usersService.remove(userId);
        }
        case 'ADD_MEDICINE': {
          const [name, form, description, manufacturer, category] = params;
          return await this.medicineService.create({ name, form: form as any, description, manufacturer, category: category as any });
        }
        case 'DELETE_MEDICINE': {
          const [medicineId] = params;
          return await this.medicineService.remove(medicineId);
        }
        case 'ADD_SPECIALIZATION': {
          const [name, description] = params;
          return await this.specializationsService.create({ name, description });
        }
        case 'UPDATE_APPOINTMENT_STATUS': {
          const [appointmentId, status] = params;
          return await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: status as AppointmentStatus },
            select: { id: true, status: true },
          });
        }
        case 'SET_WORKING_HOURS': {
          const [day, startTime, endTime] = params;
          const user = await this.prisma.user.findUnique({ where: { id: requestedByUserId }, include: { doctor: true } });
          if (!user?.doctor) throw new Error('Only doctors can set hours');
          return await this.availabilityService.upsertWorkingHours(user.doctor.id, day as WeekDay, startTime, endTime);
        }
        case 'ADD_BUSY_BLOCK': {
          const [startTime, endTime, type, reason] = params;
          const user = await this.prisma.user.findUnique({ where: { id: requestedByUserId }, include: { doctor: true } });
          if (!user?.doctor) throw new Error('Only doctors can add busy blocks');
          return await this.availabilityService.createBusyBlock(user.doctor.id, startTime, endTime, type as BlockType, reason);
        }
        case 'BOOK_APPOINTMENT': {
          const [doctorId, startTime, endTime, reason] = params;
          const sender = await this.prisma.user.findUnique({ where: { id: requestedByUserId }, include: { patient: true } });
          const patientId = sender?.patient?.id;
          if (!patientId) throw new Error('Only patients can book appointments');
          return await this.appointmentService.create({
            doctorId,
            patientId,
            startTime,
            endTime,
            reason,
            status: AppointmentStatus.PENDING,
          });
        }
        default:
          return { action, error: 'Unknown action' };
      }
    } catch (e) {
      return { action, error: (e as Error).message };
    }
  }
}
