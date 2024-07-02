import { Form, Input, Modal, Select } from "antd";
import { useRef, useState } from "react";
import { download } from "../../utils/helper";
import { transcodeDivide } from "../../utils/transcoding";

const DivideModal = ({
  setProgress,
  setIsLoading,
  divideItems,
  setDivideItems,
  isDivideModalOpen,
  setIsDivideModalOpen,
}) => {
  const [name, setName] = useState("output");
  const [extension, setExtension] = useState("mp4");
  const [items, setItems] = useState(divideItems);
  const dragItem = useRef();
  const dragOverItem = useRef();

  const showModal = () => {
    setIsDivideModalOpen(true);
  };

  const handleOk = async () => {
    let url = "undefined";

    setIsDivideModalOpen(false);

    url = await transcodeDivide(setProgress, setIsLoading, items, extension);
    download(url, name, extension);
  };

  const handleCancel = () => {
    setIsDivideModalOpen(false);
  };

  const dragStart = (e, position) => {
    dragItem.current = position;
  };
  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };
  const drop = (e) => {
    const newItems = [...items];
    const dragItemValue = items[dragItem.current];

    newItems.splice(dragItem.current, 1);
    newItems.splice(dragOverItem.current, 0, dragItemValue);
    dragItem.current = null;
    dragOverItem.current = null;
    setItems(newItems);
  };

  return (
    <Modal open={isDivideModalOpen} onCancel={handleCancel} onOk={handleOk}>
      <div className=" flex flex-col gap-2">
        <div>드래그 하여 원하는 순서대로 합쳐보세요!</div>
        <div className="flex flex-wrap w-full gap-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-center items-center w-24 h-24 bg-slate-500"
              draggable
              onDragStart={(e) => dragStart(e, idx)}
              onDragEnter={(e) => dragEnter(e, idx)}
              onDragEnd={drop}
              onDragOver={(e) => e.preventDefault()}
            >
              {item.id}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />

          <Select
            defaultValue={extension}
            onChange={(value) => setExtension(value)}
          >
            <Select.Option value="mp4">mp4</Select.Option>
            <Select.Option value="avi">avi</Select.Option>
            <Select.Option value="ogg">ogv</Select.Option>
            <Select.Option value="webm">webm</Select.Option>
          </Select>
        </div>
      </div>
    </Modal>
  );
};

export default DivideModal;
