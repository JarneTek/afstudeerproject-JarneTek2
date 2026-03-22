import MemberFormItems from "@/components/members/memberFormItems";
import { getMemberFormItemsFromToken } from "@/lib/actions/members";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import MembershipFeeMessage from "@/components/orders/MembershipFeeMessage";

export default async function OrderPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  const member = await prisma.member.findUnique({
    where: { orderToken: token },
    include: {
      club: true,
      orders: true,
    },
  });

  if (!member) {
    return notFound();
  }

  if (!member.hasPaid) {
    return <MembershipFeeMessage />;
  }

  if (member.orders.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-green" />
          <div className="w-16 h-16 bg-green-50 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
            <span className="text-xl font-bold">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Order already placed
          </h1>
          <p className="text-gray-600 leading-relaxed text-sm">
            You have already placed an order for this fitting day. Please
            contact your club if you wish to make a change.
          </p>
        </div>
      </div>
    );
  }

  const form = await getMemberFormItemsFromToken(token);

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-300" />
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 text-xl shadow-sm font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            No order form available
          </h1>
          <p className="text-gray-600 leading-relaxed text-sm">
            There is currently no order form available for your group.
            Please contact your club.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-navy/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 py-10 relative z-10 flex flex-col items-center text-center">
          {member.club.logoUrl ? (
            <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-6 relative hover:scale-105 transition-transform">
              <Image
                src={member.club.logoUrl}
                alt={member.club.name}
                fill
                className="object-contain p-2"
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-brand-navy rounded-2xl shadow-sm flex items-center justify-center mb-6 text-white text-2xl font-bold">
              {member.club.name.charAt(0)}
            </div>
          )}

          <h1 className="text-3xl font-bold text-brand-navy mb-2 tracking-tight">
            {member.club.name}
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-widest rounded-full mb-6 relative">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            Order Form
          </div>
          
          <p className="text-gray-600 max-w-lg mx-auto text-sm leading-relaxed">
            Welcome <strong className="text-brand-navy">{member.firstName} {member.lastName}</strong>! 
            Place your order below by adding items to your overview.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <MemberFormItems form={form} token={token} />
      </div>
    </div>
  );
}
