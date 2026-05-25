import { getUserOrders } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { formatPrice, formatDate } from "@/utils/format";

export default async function DashboardOrdersPage() {
  const orders = await getUserOrders();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">
        Orders
      </h1>
      <p className="mb-6 text-sm text-[var(--body)]">
        Your ticket purchases and registrations
      </p>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--hairline)] py-16">
          <ShoppingCart className="mb-3 size-8 text-[var(--muted-soft)]" />
          <p className="text-[var(--body)]">No orders yet</p>
          <p className="text-sm text-[var(--muted-text)]">
            Your tickets will appear here after purchase.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border border-[var(--hairline)] bg-[var(--canvas)] p-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-[var(--ink)]">
                    {(order.events as any)?.title}
                  </h3>
                  <Badge
                    variant={
                      order.payment_status === "completed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {order.payment_status}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--body)]">
                  {(order.events as any)?.start_time &&
                    formatDate(
                      (order.events as any).start_time,
                      (order.events as any).timezone
                    )}
                  {(order.events as any)?.venue &&
                    ` · ${(order.events as any).venue}`}
                </p>
              </div>
              <span className="font-semibold text-[var(--ink)]">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
