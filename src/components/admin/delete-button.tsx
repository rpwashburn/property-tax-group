'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteButtonProps {
  id: string | number;
  deleteAction: (id: any) => Promise<{ success: boolean; error?: string }>;
  itemType: string; // e.g., 'Neighborhood', 'Property'
}

export function DeleteButton({ id, deleteAction, itemType }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    // Optional: Add a confirmation dialog here
    // if (!confirm(`Are you sure you want to delete this ${itemType}?`)) {
    //   return;
    // }

    setIsDeleting(true);
    const result = await deleteAction(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success(`${itemType} deleted successfully.`);
    } else {
      toast.error(`Failed to delete ${itemType}: ${result.error}`);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      title={`Delete ${itemType}`}
      className="text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {isDeleting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
} 