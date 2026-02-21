"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DialogFooterProps {
  isLoading: boolean;
  createAnother: boolean;
  setCreateAnother: (value: boolean) => void;
  onCancel: () => void;
  canSubmit: boolean;
  isEditMode?: boolean;
}

export function DialogFooter({
  isLoading,
  createAnother,
  setCreateAnother,
  onCancel,
  canSubmit,
  isEditMode = false,
}: DialogFooterProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
      <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
        Annuler
      </Button>

      <div className="flex items-center gap-3">
        {!isEditMode && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.target.checked)}
              className="rounded"
            />
            Créer une autre
          </label>
        )}
        <Button type="submit" disabled={isLoading || !canSubmit}>
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-1.5 animate-spin" />
              {isEditMode ? "Enregistrement..." : "Création..."}
            </>
          ) : (
            isEditMode ? "Enregistrer" : "Créer"
          )}
        </Button>
      </div>
    </div>
  );
}
