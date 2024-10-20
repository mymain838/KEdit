import { Button, Form, Input, Select } from "antd";
import { useState } from "react";
import ReactPlayer from "react-player";
import { transcodeFilter } from "../../utils/transcoding";
import { download } from "../../utils/helper";

const FilterControl = ({
  videoSrcRef,
  mainUrl,
  setMainUrl,
  setIsLoading,
  setProgress,
}) => {
  const [filterUrl, setFilterUrl] = useState(mainUrl);

  const [hue, setHue] = useState("1");
  const [bright, setBright] = useState("0");
  const [text, setText] = useState("");
  const [textPosition, setTextPosition] = useState(["10", "10"]);
  const [textColor, setTextColor] = useState("white");
  const [textSize, setTextSize] = useState("8");
  const [name, setName] = useState("output");
  const [extension, setExtension] = useState("mp4");
  const [isReady, setIsReady] = useState(false);

  const handlePreview = async () => {
    let url = "undefined";

    url = await transcodeFilter(
      videoSrcRef.current,
      extension,
      text,
      textSize,
      textColor,
      textPosition,
      hue,
      bright,
      setIsLoading,
      setProgress
    );

    setFilterUrl(url);
    setIsReady(true);
  };

  const handleDownload = async () => {
    download(filterUrl, name, extension);
  };

  return (
    <article className="flex flex-col gap-4">
      <ReactPlayer
        width={"100%"}
        height={400}
        url={filterUrl}
        controls={true}
      />
      <Form layout="vertical">
        <div className="w-full flex justify-center gap-2">
          <Form.Item className="flex-grow" label="색조">
            <Select
              defaultValue={hue}
              onChange={(value) => {
                setHue(value);
              }}
            >
              <Select.Option value="1">1</Select.Option>
              <Select.Option value="0.5">0.5</Select.Option>
              <Select.Option value="0">0</Select.Option>
              <Select.Option value="-0.5">-0.5</Select.Option>
              <Select.Option value="-1">-1.0</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item className="flex-grow" label="밝기">
            <Select
              defaultValue={bright}
              onChange={(value) => {
                setBright(value);
              }}
            >
              <Select.Option value="1">1</Select.Option>
              <Select.Option value="0.5">0.5</Select.Option>
              <Select.Option value="0">0</Select.Option>
              <Select.Option value="-0.5">-0.5</Select.Option>
              <Select.Option value="-1">-1.0</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-center gap-2">
            <Form.Item
              className="flex-grow"
              label="오버레이 할 문장을 입력해주세요"
              required
            >
              <Input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              className="flex-grow"
              label="원하시는 위치를 선택해주세요"
            >
              <Select
                defaultValue="10,10"
                onChange={(value) => {
                  setTextPosition(value);
                }}
              >
                <Select.Option value="10,10">왼쪽 위</Select.Option>
                <Select.Option value="W-tw-10,10">오른쪽 위</Select.Option>
                <Select.Option value="(W-tw)/2,(H-th)/2">가운데</Select.Option>
                <Select.Option value="10,H-th-10">왼쪽 아래</Select.Option>
                <Select.Option value="W-tw-10,H-th-10">
                  오른쪽 아래
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="flex justify-center gap-2">
            <Form.Item className="flex-grow" label="폰트 컬러">
              <Select
                defaultValue={textColor}
                onChange={(value) => {
                  setTextColor(value);
                }}
              >
                <Select.Option value="white">하얀색</Select.Option>
                <Select.Option value="black">검정색</Select.Option>
                <Select.Option value="red">빨간색</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item className="flex-grow" label="폰트 크기">
              <Select
                defaultValue={textSize}
                onChange={(value) => {
                  setTextSize(value);
                }}
              >
                <Select.Option value="8">8px</Select.Option>
                <Select.Option value="16">16px</Select.Option>
                <Select.Option value="24">24px</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div>미리보기를 진행 후 다운로드를 실행해주세요!</div>
          <div className="flex justify-center gap-2">
            <Form.Item className="flex-grow">
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item className="flex-grow">
              <Select
                defaultValue={extension}
                onChange={(value) => setExtension(value)}
              >
                <Select.Option value="mp4">mp4</Select.Option>
                <Select.Option value="avi">avi</Select.Option>
                <Select.Option value="ogg">ogv</Select.Option>
                <Select.Option value="webm">webm</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </div>
      </Form>
      <div className="flex gap-2">
        <Button
          className="flex-grow"
          type="primary"
          size="large"
          onClick={handlePreview}
        >
          미리보기
        </Button>
        {isReady ? (
          <Button
            className="flex-grow"
            type="primary"
            size="large"
            onClick={handleDownload}
          >
            다운로드
          </Button>
        ) : (
          <Button className="flex-grow" type="primary" size="large" disabled>
            다운로드
          </Button>
        )}
      </div>
    </article>
  );
};

export default FilterControl;
