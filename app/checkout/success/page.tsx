import { prisma } from "@/lib/db";
import { createQrCode } from "@/lib/helpers/cart";
import { Decimal } from "@prisma/client/runtime/library";
import { QRCodeSVG } from "qrcode.react";
import ClipboardCopyButton from "@/components/checkout/ClipboardCopyButton";

export default async function CheckoutSuccessPage({searchParams}: {searchParams: {token?: string, orderId?: string}}) {

    const orderId = searchParams.orderId;
    const token = searchParams.token;

  if (!orderId || !token) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Invalid Order</h1>
          <p className="text-gray-500 mt-2">
            No order ID or token provided. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      member: { include: { club: true } },
    },
  });

  if (!order || order.member.orderToken !== token) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">  
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Order Not Found</h1>
          <p className="text-gray-500 mt-2">
            No order found with the provided ID and token. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const clubName = order.member.club.name;
  const iban = order.member.club.iban;
  const memberName = `${order.member.firstName} ${order.member.lastName}`.trim();
  const totalAmount = order.totalPrice as Decimal;
  const reference = memberName;
  const formattedTotal = Number(order.totalPrice).toFixed(2);

  const qrCode = iban ? createQrCode(clubName, iban, totalAmount, reference) : null;

  if (formattedTotal === "0.00") {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-500">Order Successful</h1>
          <p className="text-gray-500 mt-2">
            Your order has been placed successfully. No payment is required for this order.
          </p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-brand-navy">Checkout Successful</h1>
        {qrCode ? (
          <>
            <p className="text-gray-500 mt-2">
              Scan this QR code in your banking app to complete payment.
            </p>
            <div className="mt-6">
              <div className="inline-flex rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <QRCodeSVG value={qrCode} size={240} includeMargin />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 text-left">
              <h3 className="font-bold text-brand-navy text-lg mb-4 text-center">
                Manual Bank Transfer
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Amount to pay</p>
                  <p className="text-xl font-bold text-gray-900">EUR {formattedTotal}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">To Account (IBAN)</p>
                  <p className="text-base font-medium text-gray-800 break-all">{iban}</p>
                  <ClipboardCopyButton 
                    textToCopy={iban!.replace(/\s/g, "")} 
                    label="📋 Copy IBAN" 
                    successLabel="✅ IBAN Copied!" 
                  />
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800 font-medium mb-3">
                    <span className="text-lg leading-none mr-2">⚠️</span>
                    Include this exact reference in your payment description:
                  </p>
                  <p className="text-lg font-bold text-gray-900 bg-white px-3 py-2 rounded border border-blue-200 inline-block mb-1 break-all">
                    {reference}
                  </p>
                  <div className="block">
                    <ClipboardCopyButton 
                      textToCopy={reference} 
                      label="📋 Copy Reference" 
                      successLabel="✅ Reference Copied!" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 mt-2">Your order has been placed successfully.</p>
            <p className="mt-4 text-sm text-gray-700">
              Pay EUR {formattedTotal} cash to your trainer or club admin.
            </p>
          </>
        )}
      </div>
    </div>
  );
}