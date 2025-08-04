import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons"; // Or your preferred icon library

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this link? This action cannot be undone.",
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
          <Dialog.Title className="text-lg font-medium text-linka-russian-violet">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-linka-night/60 mt-2">
            {description}
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                className="px-4 py-2 text-sm text-linka-night/80 hover:bg-linka-alice-blue/10 rounded"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={() => {
                onConfirm();
                onOpenChange(false); // Close the dialog after confirming
              }}
              className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded"
            >
              Delete
            </button>
          </div>
          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 text-linka-night/60 hover:text-linka-night">
              <Cross2Icon className="w-4 h-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmDialog;