import { getOrders } from "@/lib/admin/server";
import { OrdersTable } from "./orders-table";

export default async function AdminOrdersPage({ searchParams }: {
  searchParams?: Promise<{ page?: string; limit?: string; }>;
}) {
  // Await searchParams
  const searchParamsResolved = searchParams ? await searchParams : {};
  const limit = parseInt(searchParamsResolved?.limit || '100', 10); // Load more data initially
  const page = parseInt(searchParamsResolved?.page || '1', 10);

  // Fetch ALL orders (no status filter) - let client handle filtering
  const result = await getOrders(page, limit);

  if (!result.success) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Order Management</h1>
        <p className="text-destructive">Error loading orders: {result.error}</p>
      </div>
    );
  }

  const { data } = result;
  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Order Management</h1>
        <p className="text-muted-foreground">No data received from API.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <OrdersTable 
        initialOrders={data.orders} 
        totalCount={data.total_count}
        statusSummary={data.status_summary}
      />
    </div>
  );
} 