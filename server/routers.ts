import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Biomarker readings
  biomarkers: router({
    getByDateRange: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ ctx, input }) => {
        return await db.getBiomarkerReadings(ctx.user.id, input.startDate, input.endDate);
      }),

    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLatestBiomarkerReadings(ctx.user.id);
    }),
  }),

  // Mood assessments
  assessments: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getMoodAssessments(ctx.user.id, input?.limit);
      }),

    create: protectedProcedure
      .input(
        z.object({
          assessmentType: z.enum(["mood", "phq9", "gad7"]),
          mood: z.string().optional(),
          moodScore: z.number().optional(),
          totalScore: z.number().optional(),
          responses: z.string().optional(),
          notes: z.string().optional(),
          assessmentDate: z.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createMoodAssessment({
          userId: ctx.user.id,
          assessmentType: input.assessmentType,
          assessmentDate: input.assessmentDate,
          mood: input.mood ?? null,
          moodScore: input.moodScore ?? null,
          totalScore: input.totalScore ?? null,
          responses: input.responses ?? null,
          notes: input.notes ?? null,
        });
        return { success: true };
      }),
  }),

  // Medications
  medications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getMedications(ctx.user.id);
    }),

    logs: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getMedicationLogs(ctx.user.id, input?.limit);
      }),
  }),

  // Devices
  devices: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getDevices(ctx.user.id);
    }),

    getActive: protectedProcedure.query(async ({ ctx }) => {
      return await db.getActiveDevice(ctx.user.id);
    }),
  }),

  // Alerts
  alerts: router({
    list: protectedProcedure
      .input(z.object({ includeRead: z.boolean().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getAlerts(ctx.user.id, input?.includeRead);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markAlertAsRead(input.alertId);
        return { success: true };
      }),
  }),

  // Journal
  journal: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getJournalEntries(ctx.user.id, input?.limit);
      }),

    create: protectedProcedure
      .input(
        z.object({
          entryType: z.enum(["symptom", "medication", "lifestyle", "mood"]),
          entryDate: z.date(),
          title: z.string(),
          description: z.string().optional(),
          severity: z.number().optional(),
          tags: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createJournalEntry({
          userId: ctx.user.id,
          entryType: input.entryType,
          entryDate: input.entryDate,
          title: input.title,
          description: input.description ?? null,
          severity: input.severity ?? null,
          tags: input.tags ?? null,
        });
        return { success: true };
      }),
  }),

  // Appointments
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAppointments(ctx.user.id);
    }),

    upcoming: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUpcomingAppointments(ctx.user.id);
    }),
  }),

  // Care Team
  careTeam: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCareTeamMembers(ctx.user.id);
    }),
  }),

  // Insights
  insights: router({
    list: protectedProcedure
      .input(z.object({ includeRead: z.boolean().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getInsights(ctx.user.id, input?.includeRead);
      }),
    
    generate: protectedProcedure.query(async ({ ctx }) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const dbReadings = await db.getBiomarkerReadings(ctx.user.id, startDate, endDate);
      const dbMoodAssessments = await db.getMoodAssessments(ctx.user.id, 30);
      
      // Map database readings to AI insights format
      const biomarkerReadings = dbReadings.map(r => ({
        biomarkerType: r.biomarkerType,
        value: r.value,
        readingDate: r.measuredAt
      }));
      
      const moodAssessments = dbMoodAssessments.map(m => ({
        assessmentType: m.assessmentType,
        moodScore: m.moodScore,
        totalScore: m.totalScore,
        assessmentDate: m.assessmentDate
      }));
      
      const { generateInsights } = await import("./ai-insights");
      return generateInsights(biomarkerReadings, moodAssessments);
    }),
  }),

  // Relapse Risk
  relapseRisk: router({
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLatestRelapseRiskScore(ctx.user.id);
    }),

    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getRelapseRiskHistory(ctx.user.id, input?.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
