import { Button } from "@/components/ui/button";
import { Plus, Pencil, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getNeighborhoodCodes, deleteNeighborhoodCode } from "@/lib/admin/server";
import { DeleteButton } from "@/components/admin/delete-button";
import type { NeighborhoodCode } from "@/lib/admin/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminNeighborhoodsPage({ searchParams }: {
  searchParams?: Promise<{ page?: string; limit?: string; }>;
}) {
  const searchParamsResolved = searchParams ? await searchParams : {};
  const limit = parseInt(searchParamsResolved?.limit || '15', 10);
  const page = parseInt(searchParamsResolved?.page || '1', 10);
  const offset = (page - 1) * limit;

  const result = await getNeighborhoodCodes(limit, offset);

  if (!result.success) {
    const errorMessage = 'error' in result ? result.error : 'An unknown error occurred.';
    return <p className="text-destructive">Error loading neighborhoods: {errorMessage}</p>;
  }

  const { data: neighborhoods, totalCount } = result;

  const totalPages = Math.ceil(totalCount / limit);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Neighborhood Codes</h1>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Neighborhood
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Showing {neighborhoods?.length ?? 0} of {totalCount} neighborhoods.
      </p>
      
      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of neighborhood codes (Page {page} of {totalPages}).</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Group Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {neighborhoods && neighborhoods.length > 0 ? (
              neighborhoods.map((nbh: NeighborhoodCode) => (
                <TableRow key={nbh.id}>
                  <TableCell className="font-medium">{nbh.code}</TableCell>
                  <TableCell>{nbh.groupCode}</TableCell>
                  <TableCell>{nbh.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Edit Neighborhood">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteButton 
                        id={nbh.id} 
                        deleteAction={deleteNeighborhoodCode as (id: string | number) => Promise<{ success: boolean; error?: string }>}
                        itemType="Neighborhood"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No neighborhoods found for this page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button asChild variant="outline" disabled={!hasPrevPage}>
          <Link href={`/admin/neighborhoods?page=${page - 1}&limit=${limit}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button asChild variant="outline" disabled={!hasNextPage}>
          <Link href={`/admin/neighborhoods?page=${page + 1}&limit=${limit}`}>
             Next <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 