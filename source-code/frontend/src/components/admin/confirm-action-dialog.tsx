"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ADMIN_ACTION_CANCEL_BUTTON } from "@/components/admin/action-button-styles";

type ConfirmActionDialogProps = {
  triggerLabel: string;
  triggerClassName: string;
  title: string;
  description: ReactNode;
  action: () => void | Promise<void>;
  confirmLabel: string;
  pendingLabel: string;
  confirmClassName: string;
  cancelLabel?: string;
};

function ConfirmSubmitButton({
  idleLabel,
  pendingLabel,
  className,
}: {
  idleLabel: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

export function ConfirmActionDialog({
  triggerLabel,
  triggerClassName,
  title,
  description,
  action,
  confirmLabel,
  pendingLabel,
  confirmClassName,
  cancelLabel = "Cancel",
}: ConfirmActionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger className={triggerClassName}>{triggerLabel}</DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="max-w-md rounded-2xl p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-text-heading">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-text-body">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form action={action}>
          <DialogFooter className="mt-5 flex gap-2">
            <DialogClose
              render={
                <button type="button" className={ADMIN_ACTION_CANCEL_BUTTON} />
              }
            >
              {cancelLabel}
            </DialogClose>

            <ConfirmSubmitButton
              idleLabel={confirmLabel}
              pendingLabel={pendingLabel}
              className={confirmClassName}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
