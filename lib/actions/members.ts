"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function getClubMembers(clubId: string) {
    const session = await getSession();
    if (!session) {
        throw new Error("No session found");
    }
    const clubUser = await prisma.clubUser.findUnique({
        where: {
            userId_clubId: {
                userId: session.id,
                clubId,
            },
        },
    });
    if (!clubUser) {
        throw new Error("Not authorized");
    }
    const members = await prisma.member.findMany({
        where: {
            clubId: clubId,
        },
    });
    return members;
}

export async function toggleHasPaid(memberId: string) {
    const session = await getSession();
    if (!session) {
        throw new Error("No session found");
    }
    const member = await prisma.member.findUnique({
        where: {
            id: memberId,
        },
    });
    if (!member) {
        throw new Error("Member not found");
    }
    const clubUser = await prisma.clubUser.findUnique({
        where: {
            userId_clubId: {
                userId: session.id,
                clubId: member.clubId,
            },
        },
    });
    if (!clubUser) {
        throw new Error("Not authorized");
    }
    await prisma.member.update({
        where: {
            id: memberId,
        },
        data: {
            hasPaid: !member.hasPaid,
        },
    });
    revalidatePath(`/dashboard/members`);
}