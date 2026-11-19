"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form";
import { useI18n } from "@/i18n/I18nProvider";
import { format, plural } from "@/i18n/format";
import { Mascot } from "@/components/common/mascot";

/** Confirmation step before anything is removed. Requires an explicit "I understand". */
export function RemoveDialog({
  open,
  count,
  rolesCount,
  hiddenSelected,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  count: number;
  /** Accounts to be removed that are subs / mods / VIPs — a heads-up, not a block. */
  rolesCount: number;
  /** Ticked accounts hidden by filters (still removed). */
  hiddenSelected: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { dict } = useI18n();
  const t = dict.remove;
  const [ack, setAck] = useState(false);

  const close = () => {
    setAck(false);
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={plural(count, t.dialogTitleOne, t.dialogTitle, { count: count.toLocaleString() })}
      closeLabel={dict.common.close}
    >
      <div className="space-y-3 text-sm">
        <Mascot name="confirm" size={180} className="mx-auto -mt-2" />
        {hiddenSelected > 0 && (
          <p className="rounded-md bg-warning-soft px-3 py-2 text-warning-fg">
            {format(t.hiddenSelected, { count: hiddenSelected })}
          </p>
        )}
        {rolesCount > 0 && (
          <p className="rounded-md bg-brand-soft px-3 py-2 text-brand-fg">
            {format(t.rolesWarning, { count: rolesCount })}
          </p>
        )}
        <ul className="space-y-1.5 rounded-md bg-warning-soft px-3 py-2 text-warning-fg">
          <li className="flex gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t.irreversible}
          </li>
          <li className="pl-6">{t.sideEffect}</li>
        </ul>
        <Checkbox label={t.ack} checked={ack} onChange={(e) => setAck(e.target.checked)} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={close}>
          {dict.common.cancel}
        </Button>
        <Button
          variant="danger"
          disabled={!ack || count === 0}
          onClick={() => {
            setAck(false);
            onConfirm();
          }}
        >
          {t.start}
        </Button>
      </div>
    </Dialog>
  );
}
