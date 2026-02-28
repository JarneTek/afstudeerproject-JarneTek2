"use server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getClubOrders(clubId: string) {
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
    const orders = await prisma.order.findMany({
        where: {
            member: {
                clubId,
            },
        },
        include: {
            member: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
    return orders;
}
