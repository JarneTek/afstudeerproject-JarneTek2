import React from "react";

export default function MembershipFeeMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-400" />
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Membership Fee Unpaid
        </h1>
        <p className="text-gray-600 leading-relaxed text-sm">
          You must pay your membership fee before you can place an order. Please
          contact your club for more information.
        </p>
      </div>
    </div>
  );
}
