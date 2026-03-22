"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendOrderLinkEmail } from "./email";
import { startFittingDaySchema } from "../validations/fittingDay";

export async function startFittingDay(clubId: string, formId: string, formData: FormData) {

    const validated = startFittingDaySchema.safeParse({
        date: formData.get("date"), 
        startTime: formData.get("startTime"), 
        endTime: formData.get("endTime"), 
        location: formData.get("location")
    });
    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors };
    }

    const club = await prisma.club.findUnique({
        where: { id: clubId },
    });
    if (!club) {
        return { error: "Club not found" };
    }

    const form = await prisma.form.findUnique({
        where: { id: formId },
    });
    if (!form) {
        return { error: "Form not found" };
    }

    const members = await prisma.member.findMany({
        where: {
            clubId,
            group: {
                in: form.targetGroups,
            },
        },
        orderBy: {
            id: 'asc',
        },
    });

    if (members.length === 0) {
        return { error: "No members found for the selected form" };
    }

    const newDate = new Date(validated.data.date);
    const startOfDay = new Date(newDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(newDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingDays = await prisma.fittingDay.findMany({
        where: {
            clubId,
            date: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });

    const newStart = validated.data.startTime;
    const newEnd = validated.data.endTime;

    for (const day of existingDays) {
        if (newStart < day.endTime && newEnd > day.startTime) {
            const hasOverlappingGroup = form.targetGroups.some(group => 
                day.targetGroups.includes(group)
            );
            if (hasOverlappingGroup) {
                return { error: "There is already an overlapping fitting day scheduled for one or more of these target groups at this time." };
            }
        }
    }

    const fittingDay = await prisma.fittingDay.create({
        data: {
            clubId,
            date: new Date(validated.data.date),
            startTime: validated.data.startTime,
            endTime: validated.data.endTime,
            location: validated.data.location,
            targetGroups: form.targetGroups,
        },
    });

    for (const member of members) {
        const token = crypto.randomUUID();

        await prisma.member.update({
            where: { id: member.id },
            data: { orderToken: token, fittingDayId: fittingDay.id },
        });

        const envUrl = process.env.NEXT_PUBLIC_APP_URL;
        const baseUrl = envUrl && envUrl !== "http://localhost:3000"
            ? envUrl
            : process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : "http://localhost:3000";

        const orderLink = `${baseUrl}/order/${token}`;
        const formattedDate = fittingDay.date.toLocaleDateString('nl-BE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        await sendOrderLinkEmail(orderLink, member.email, club.name, fittingDay.startTime, fittingDay.endTime, formattedDate);
    }
    return { success: "Fitting day started successfully", fittingDay };

}