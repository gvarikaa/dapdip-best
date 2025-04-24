"use client";

import Link from "next/link";

const EmptyState = () => {
  return (
    <div className="py-4 text-center">
      <p className="text-textGray mb-2">ჯერჯერობით რეკომენდაციები არ გვაქვს</p>
      <p className="text-sm text-textGray mb-3">
        დაუკავშირდით მეტ ადამიანს, რომ მიიღოთ პერსონალიზებული რეკომენდაციები
      </p>
      <Link 
        href="/explore" 
        className="text-iconBlue hover:underline text-sm"
      >
        მოძებნეთ ახალი კონტაქტები
      </Link>
    </div>
  );
};

export default EmptyState;