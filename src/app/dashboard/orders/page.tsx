import { getUserOrders } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { formatPrice, formatDate } from "@/utils/format";

export default async function DashboardOrdersPage() {
  const orders = await getUserOrders();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Orders</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Your ticket purchases and registrations
      </p>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <ShoppingCart className="mb-3 size-8 text-muted-foreground" />
          <p className="text-muted-foreground">No orders yet</p>
          <p className="text-sm text-muted-foreground">
            Your tickets will appear here after purchase.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
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
                <p className="text-sm text-muted-foreground">
                  {(order.events as any)?.start_time &&
                    formatDate(
                      (order.events as any).start_time,
                      (order.events as any).timezone
                    )}
                  {(order.events as any)?.venue &&
                    ` . ${(order.events as any).venue}`}
                </p>
              </div>
              <span className="font-semibold">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
