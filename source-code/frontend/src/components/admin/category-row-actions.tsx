"use client";

import Link from "next/link";
import {
  ADMIN_ACTION_DELETE_BUTTON,
  ADMIN_ACTION_DELETE_CONFIRM_BUTTON,
  ADMIN_ACTION_EDIT_BUTTON,
} from "@/components/admin/action-button-styles";
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";

type CategoryRowActionsProps = {
  categoryId: string;
  productCount: number;
  deleteAction: () => void | Promise<void>;
};

export function CategoryRowActions({ categoryId, productCount, deleteAction }: CategoryRowActionsProps) {
  const description =
    productCount > 0
      ? `This category still has ${productCount} products. Delete will be rejected until products are moved or removed.`
      : "This action permanently deletes the category.";

  return (
    <div className="flex justify-end gap-2">
      <Link
        href={`/admin/categories/${categoryId}`}
        className={ADMIN_ACTION_EDIT_BUTTON}
      >
        Edit
      </Link>

      <ConfirmActionDialog
        triggerLabel="Delete"
        triggerClassName={ADMIN_ACTION_DELETE_BUTTON}
        title="Delete category?"
        description={description}
        action={deleteAction}
        confirmLabel="Yes, delete"
        pendingLabel="Processing..."
        confirmClassName={ADMIN_ACTION_DELETE_CONFIRM_BUTTON}
      />
    </div>
  );
}
