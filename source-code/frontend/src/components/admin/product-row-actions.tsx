"use client";

import Link from "next/link";
import {
  ADMIN_ACTION_DELETE_BUTTON,
  ADMIN_ACTION_DELETE_CONFIRM_BUTTON,
  ADMIN_ACTION_EDIT_BUTTON,
} from "@/components/admin/action-button-styles";
import { ConfirmActionDialog } from "@/components/admin/confirm-action-dialog";

type ProductRowActionsProps = {
  productId: string;
  deleteAction: () => void | Promise<void>;
};

export function ProductRowActions({
  productId,
  deleteAction,
}: ProductRowActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Link
        href={`/admin/products/${productId}`}
        className={ADMIN_ACTION_EDIT_BUTTON}
      >
        Edit
      </Link>

      <ConfirmActionDialog
        triggerLabel="Delete"
        triggerClassName={ADMIN_ACTION_DELETE_BUTTON}
        title="Delete product permanently?"
        description="This permanently removes the product and its stock audit references. This cannot be undone."
        action={deleteAction}
        confirmLabel="Yes, delete"
        pendingLabel="Deleting..."
        confirmClassName={ADMIN_ACTION_DELETE_CONFIRM_BUTTON}
      />
    </div>
  );
}
