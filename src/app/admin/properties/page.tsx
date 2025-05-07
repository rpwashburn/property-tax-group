import { Button } from "@/components/ui/button";
import { Plus, Pencil, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAllPropertyData, deletePropertyData } from "@/lib/admin/server"; // Import server actions
import { DeleteButton } from "@/components/admin/delete-button";
import type { PropertyData } from "@/lib/admin/types"; // Added type import
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns'; // For date formatting

export default async function AdminPropertiesPage({ searchParams }: {
  searchParams?: Promise<{ page?: string; limit?: string; }>; // Wrap searchParams in Promise
}) {
  // Await searchParams if needed
  const searchParamsResolved = searchParams ? await searchParams : {};
  const limit = parseInt(searchParamsResolved?.limit || '25', 10); // Default limit 25
  const page = parseInt(searchParamsResolved?.page || '1', 10);
  const offset = (page - 1) * limit;

  // Fetch data with pagination
  const result = await getAllPropertyData(limit, offset);

  if (!result.success) {
    const errorMessage = 'error' in result ? result.error : 'An unknown error occurred.';
    return <p className="text-destructive">Error loading properties: {errorMessage}</p>;
  }
  
  const { data: properties, totalCount } = result;

  const totalPages = Math.ceil(totalCount / limit);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Properties</h1>
        {/* TODO: Link to Add Property page/form */}
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Showing {properties?.length ?? 0} of {totalCount} properties.
      </p>

      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of properties (Page {page} of {totalPages}).</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Account #</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Market Value</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties && properties.length > 0 ? (
              properties.map((prop: PropertyData) => (
                <TableRow key={prop.id}>
                  <TableCell className="font-medium font-mono">{prop.acct}</TableCell>
                  <TableCell>{prop.siteAddr1}</TableCell>
                  <TableCell>${Number(prop.totMktVal)?.toLocaleString()}</TableCell>
                  <TableCell>{format(new Date(prop.createdAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* TODO: Link to Edit Property page/form */}
                      <Button variant="ghost" size="icon" title="Edit Property">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteButton 
                        id={prop.id} 
                        deleteAction={deletePropertyData as (id: string | number) => Promise<{ success: boolean; error?: string }>} // Direct server action
                        itemType="Property"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No properties found for this page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button asChild variant="outline" disabled={!hasPrevPage}>
          <Link href={`/admin/properties?page=${page - 1}&limit=${limit}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button asChild variant="outline" disabled={!hasNextPage}>
          <Link href={`/admin/properties?page=${page + 1}&limit=${limit}`}>
             Next <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 