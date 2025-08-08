"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Filter, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/admin/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';

interface OrdersTableProps {
  initialOrders: Order[];
  totalCount: number;
  statusSummary: Array<{
    status: string;
    count: number;
  }>;
}

type StatusFilter = "all" | "payment_completed" | "payment_pending" | "payment_failed" | "cancelled";

export function OrdersTable({ initialOrders, totalCount, statusSummary }: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Filter orders based on status and search term
  const filteredOrders = useMemo(() => {
    let filtered = initialOrders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term (customer name, email, or account number)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchLower) ||
        order.customer_email.toLowerCase().includes(searchLower) ||
        order.account_number.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [initialOrders, statusFilter, searchTerm]);

  // Calculate filtered summary stats
  const filteredStats = useMemo(() => {
    const total = filteredOrders.length;
    const completed = filteredOrders.filter(o => o.status === 'payment_completed').length;
    const generated = filteredOrders.filter(o => o.report_generated).length;
    const pending = filteredOrders.filter(o => !o.report_generated && o.status === 'payment_completed').length;

    return { total, completed, generated, pending };
  }, [filteredOrders]);

  // Navigate to comparables analysis
  const handleViewComparables = (order: Order) => {
    router.push(`/admin/comparables/${order.account_number}`);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'payment_completed': return "default";
      case 'payment_pending': return "secondary";
      case 'payment_failed': return "destructive";
      default: return "outline";
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="payment_completed">Payment Completed</SelectItem>
                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                <SelectItem value="payment_failed">Payment Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <Input
            placeholder="Search by customer, email, account, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
        </div>

        {/* Current Filter Badge */}
        <Badge variant="secondary">
          {statusFilter === "all" ? "All Orders" : formatStatus(statusFilter)}
          {searchTerm && ` • "${searchTerm}"`}
        </Badge>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Showing {filteredStats.total} of {totalCount} orders
          {statusFilter !== "all" && ` (filtered by ${formatStatus(statusFilter)})`}
          {searchTerm && ` (search: "${searchTerm}")`}
        </p>
        
        {/* Status Summary from API */}
        {statusSummary && statusSummary.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            {statusSummary.map((summary) => (
              <Badge key={summary.status} variant="outline" className="text-xs">
                {formatStatus(summary.status)}: {summary.count}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableCaption>
            {filteredStats.total} {statusFilter === "all" ? "orders" : formatStatus(statusFilter) + " orders"} found
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Account #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Report Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order: Order) => (
                <TableRow key={`order-${order.id}`}>
                  <TableCell className="font-medium font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.customer_name}</span>
                      <span className="text-xs text-muted-foreground">{order.customer_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.product_type}</Badge>
                  </TableCell>
                  <TableCell>${(order.amount / 100).toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-sm">{order.account_number}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.report_generated ? "default" : "secondary"}>
                      {order.report_generated ? "Generated" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => handleViewComparables(order)}
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      disabled={order.status !== 'payment_completed'}
                    >
                      <BarChart3 className="h-4 w-4" />
                      {order.status !== 'payment_completed' ? "Unavailable" : "View Comparables"}
                      {order.status === 'payment_completed' && (
                        <ArrowRight className="h-3 w-3" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  {searchTerm || statusFilter !== "all" 
                    ? "No orders found matching your filters." 
                    : "No orders found."
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Filtered Results Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Filtered Orders:</span>
            <div className="font-semibold">{filteredStats.total}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Completed Payments:</span>
            <div className="font-semibold">{filteredStats.completed}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Reports Generated:</span>
            <div className="font-semibold">{filteredStats.generated}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Pending Reports:</span>
            <div className="font-semibold">{filteredStats.pending}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 