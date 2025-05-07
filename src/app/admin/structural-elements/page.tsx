import { Button } from "@/components/ui/button";
import { Plus, Pencil, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAllStructuralElements, deleteStructuralElement } from "@/lib/admin/server"; // Import server actions
import { DeleteButton } from "@/components/admin/delete-button";
import type { StructuralElement } from "@/lib/admin/types"; // Added type import
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminStructuralElementsPage({ searchParams }: {
  searchParams?: Promise<{ page?: string; limit?: string; }>; // Wrap searchParams in Promise
}) {
  // Await searchParams if needed
  const searchParamsResolved = searchParams ? await searchParams : {};
  const limit = parseInt(searchParamsResolved?.limit || '25', 10);
  const page = parseInt(searchParamsResolved?.page || '1', 10);
  const offset = (page - 1) * limit;

  // Fetch data with pagination
  const result = await getAllStructuralElements(limit, offset);

  if (!result.success) {
    const errorMessage = 'error' in result ? result.error : 'An unknown error occurred.';
    return <p className="text-destructive">Error loading structural elements: {errorMessage}</p>;
  }

  const { data: elements, totalCount } = result;

  const totalPages = Math.ceil(totalCount / limit);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Structural Elements</h1>
        {/* TODO: Link to Add Element page/form */}
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Element
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Showing {elements?.length ?? 0} of {totalCount} structural elements.
      </p>

      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of structural elements (Page {page} of {totalPages}).</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Account #</TableHead>
              <TableHead>Building #</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type Desc</TableHead>
              <TableHead>Category Desc</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {elements && elements.length > 0 ? (
              elements.map((el: StructuralElement) => (
                <TableRow key={el.id}>
                  <TableCell className="font-medium font-mono">{el.acct}</TableCell>
                  <TableCell>{el.bldNum}</TableCell>
                  <TableCell>{el.code}</TableCell>
                  <TableCell>{el.typeDscr}</TableCell>
                  <TableCell>{el.categoryDscr}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* TODO: Link to Edit Element page/form */}
                      <Button variant="ghost" size="icon" title="Edit Element">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteButton 
                        id={el.id} 
                        deleteAction={deleteStructuralElement as (id: string | number) => Promise<{ success: boolean; error?: string }>} // Direct server action
                        itemType="Structural Element"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No structural elements found for this page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button asChild variant="outline" disabled={!hasPrevPage}>
          <Link href={`/admin/structural-elements?page=${page - 1}&limit=${limit}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button asChild variant="outline" disabled={!hasNextPage}>
          <Link href={`/admin/structural-elements?page=${page + 1}&limit=${limit}`}>
             Next <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 