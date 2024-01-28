import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import EditEntryData from "./EditEntryData";
import { supabase } from "@/lib/utils";

const EditEntry = ({ entryData }: { entryData: any }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button 
      className="text-[#333] hover:text-primary !bg-transparent" 
      variant="light" 
      onPress={onOpen} 
      isIconOnly>
        <PencilSquareIcon className="w-5 h-5" /></Button>
      <Modal 
      
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      classNames={
        {
          body: "pt-10",
          base: "max-w-7xl",
        }
      }
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <EditEntryData entryData={entryData} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default EditEntry