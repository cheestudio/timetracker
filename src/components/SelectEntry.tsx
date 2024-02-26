import { Button } from '@nextui-org/react';

const SelectEntry = ({ selectedKeys, deleteTimeEntry }: { selectedKeys: [], deleteTimeEntry: () => void }) => {
  return (
    <>
      {selectedKeys && selectedKeys.length > 0 &&
        <div>
          <Button
            variant="flat"
            color="warning"
            onPress={() => deleteTimeEntry()}>
            Remove Selected
          </Button>
        </div>
      }
    </>
  );
}

export default SelectEntry;