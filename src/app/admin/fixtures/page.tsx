import { Button } from "@/components/ui/button";
import { Plus, Pencil, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAllFixtures, deleteFixture } from "@/lib/admin/server"; // Import server actions
import { DeleteButton } from "@/components/admin/delete-button";
import type { Fixture } from "@/lib/admin/types"; // Added type import
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

// Define props for search params
interface AdminFixturesPageProps {
  searchParams?: {
    page?: string;
    limit?: string;
  };
}

export default async function AdminFixturesPage({ searchParams }: AdminFixturesPageProps) {
  const limit = parseInt(searchParams?.limit || '25', 10);
  const page = parseInt(searchParams?.page || '1', 10);
  const offset = (page - 1) * limit;

  // Fetch data with pagination
  const result = await getAllFixtures(limit, offset);

  if (!result.success) {
    const errorMessage = 'error' in result ? result.error : 'An unknown error occurred.';
    return <p className="text-destructive">Error loading fixtures: {errorMessage}</p>;
  }
  
  const { data: fixtures, totalCount } = result;

  const totalPages = Math.ceil(totalCount / limit);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Fixtures</h1>
        {/* TODO: Link to Add Fixture page/form */}
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Fixture
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Showing {fixtures?.length ?? 0} of {totalCount} fixtures.
      </p>

      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of fixtures (Page {page} of {totalPages}).</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Account #</TableHead>
              <TableHead>Building #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Units</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixtures && fixtures.length > 0 ? (
              fixtures.map((fix: Fixture) => (
                <TableRow key={fix.id}>
                  <TableCell className="font-medium font-mono">{fix.acct}</TableCell>
                  <TableCell>{fix.bldNum}</TableCell>
                  <TableCell>{fix.typeDscr}</TableCell>
                  <TableCell>{fix.units}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* TODO: Link to Edit Fixture page/form */}
                      <Button variant="ghost" size="icon" title="Edit Fixture">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteButton 
                        id={fix.id} 
                        deleteAction={deleteFixture} // Direct server action
                        itemType="Fixture"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No fixtures found for this page.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button asChild variant="outline" disabled={!hasPrevPage}>
          <Link href={`/admin/fixtures?page=${page - 1}&limit=${limit}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button asChild variant="outline" disabled={!hasNextPage}>
          <Link href={`/admin/fixtures?page=${page + 1}&limit=${limit}`}>
             Next <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 