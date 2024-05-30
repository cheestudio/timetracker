import { Modal, ModalContent, ModalBody, Button, useDisclosure } from "@nextui-org/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import EditEntryData from "./EditEntryData";

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
          base: "max-w-7xl border border-gray-300/20",
          backdrop: "bg-black/70 backdrop-opacity-20",
          body: "pt-10",
        }
      }
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <EditEntryData closeToggle={onClose} entryData={entryData} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default EditEntry