import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Slider } from "antd";
import { useRef, useState } from "react";
import {
  download,
  formatTime,
  sliderValueToVideoTime,
} from "../../utils/helper";
import ReactPlayer from "react-player";
import { transcodeFile } from "../../utils/transcoding";

const MergeControl = ({
  id,
  isMain,
  mergeItem,
  setMergeItem,
  setProgress,
  setIsLoading,
  mainVideoSrc,
  mergevideoSrc,
}) => {
  const videoSrcRef = useRef(URL.createObjectURL(mergevideoSrc));
  const [ishover, setIsHover] = useState(false);
  const [mergeData, setMergeData] = useState([]);
  const mergeUploadRef = useRef(null);

  const [name, setName] = useState("output");
  const [speed, setSpeed] = useState("1");
  const [quality, setQuality] = useState("low");
  const [extension, setExtension] = useState("mp4");
  const [sliderValues, setSliderValues] = useState([0, 100]);
  // 플레이어 상태
  const [playerState, setPlayerState] = useState({
    duration: 0,
    playedSeconds: 0,
  });

  const playerRef = useRef(null);

  const handleSeek = () => {
    if (playerRef.current) {
      update("sliderValues", sliderValues);
      const timeInSeconds = parseFloat(
        sliderValueToVideoTime(playerState.duration, sliderValues[0])
      );

      if (
        !isNaN(timeInSeconds) &&
        timeInSeconds >= 0 &&
        timeInSeconds <= playerState.duration
      ) {
        playerRef.current.seekTo(timeInSeconds, "seconds");
      }
    }
  };
  const update = (key, value) => {
    const modifyData = mergeItem.map((item) =>
      parseInt(item.id) === parseInt(id) ? { ...item, [key]: value } : item
    );
    setMergeItem(modifyData);
  };
  const updateState = (key, value) => {
    const modifyData = mergeItem.map((item) =>
      parseInt(item.id) === parseInt(id)
        ? { ...item, playerState: { ...item.playerState, [key]: value } }
        : item
    );
    setMergeItem(modifyData);
  };
  const handleDelete = () => {
    const modifyData = mergeItem.filter((item) => {
      return parseInt(item.id) !== parseInt(id);
    });
    setMergeItem(modifyData);
  };

  const handleDownload = async (e) => {
    let url = "undefined";

    url = await transcodeFile(
      playerState,
      sliderValues,
      setProgress,
      setIsLoading,
      videoSrcRef,
      { current: extension },
      speed
    );

    download(url, name, extension);
  };

  return (
    <section className="flex justify-between gap-4 p-2 border-b">
      <div className="flex flex-col w-[50%] justify-around">
        <div className="flex flex-wrap ">
          <Form layout="vertical" className="flex w-full gap-3">
            <Form.Item className="flex-grow" label="속도">
              <Select
                defaultValue={speed}
                onChange={(value) => {
                  setSpeed(value);
                  update("speed", value);
                }}
              >
                <Select.Option value="0.5">x0.5</Select.Option>
                <Select.Option value="1.0">x1</Select.Option>
                <Select.Option value="1.5">x1.5</Select.Option>
                <Select.Option value="2.0">x2.0</Select.Option>
                <Select.Option value="2.5">x2.5</Select.Option>
                <Select.Option value="3.0">x3.0</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item className="flex-grow" label="화질">
              <Select
                defaultValue={quality}
                onChange={(value) => {
                  setQuality(value);
                  update("quality", value);
                }}
              >
                <Select.Option value="low">저화질</Select.Option>
                <Select.Option value="high">고화질</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item className="flex-grow" label="확장자">
              <Select
                defaultValue={extension}
                onChange={(value) => {
                  setExtension(value);
                  update("extension", value);
                }}
              >
                <Select.Option value="mp4">mp4</Select.Option>
                <Select.Option value="avi">avi</Select.Option>
                <Select.Option value="ogg">ogv</Select.Option>
                <Select.Option value="webm">webm</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </div>

        <Form>
          <Form.Item
            label={
              <div className="text-lg">{isMain ? `Main` : `No.${id}`}</div>
            }
          >
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                update("name", e.target.value);
              }}
            />
          </Form.Item>
        </Form>

        <div className="flex justify-center gap-10">
          {!isMain ? (
            <>
              <Button
                className=""
                type="primary"
                size="large"
                onClick={handleDownload}
              >
                다운로드
              </Button>

              <Button
                className=""
                type="primary"
                size="large"
                onClick={handleDelete}
              >
                삭제하기
              </Button>
            </>
          ) : (
            <Button className="w-full" type="primary" size="large" disabled>
              기본 메인 비디오입니다.
            </Button>
          )}
        </div>

        <div className="flex justify-center font-semibold text-base">
          <span className="text-gray-500">재생시간: </span>
          {formatTime(playerState.playedSeconds)}초
        </div>

        <Slider
          range
          value={sliderValues}
          defaultValue={[0, 100]}
          onChange={(value) => {
            setSliderValues(value);
            //   handleSeek();
          }}
          tooltip={{
            formatter: (value) =>
              `${formatTime(
                sliderValueToVideoTime(playerState.duration, value)
              )}`,
          }}
        />

        <div className="flex justify-between  w-full mb-2">
          <span className="text-gray-400">00:00</span>
          <span>{formatTime(playerState.duration)}</span>
        </div>
      </div>

      <div>
        <ReactPlayer
          ref={playerRef}
          width={"100%"}
          height={300}
          url={videoSrcRef.current}
          controls={true}
          onDuration={(duration) => {
            // 총 시간 저장
            setPlayerState({ ...playerState, duration: duration });
            updateState("duration", duration);
          }}
          progressInterval={100}
          onProgress={({ playedSeconds, played }) => {
            const maxTime = sliderValueToVideoTime(
              playerState.duration,
              sliderValues[1]
            );
            const minTime = sliderValueToVideoTime(
              playerState.duration,
              sliderValues[0]
            );

            // 재생 시간 저장
            setPlayerState({
              ...playerState,
              playedSeconds: playedSeconds,
            });
            updateState("playedSeconds", playedSeconds);

            // 종료 지점
            if (maxTime !== null && playedSeconds >= maxTime) {
              playerRef.current.seekTo(minTime, "seconds");
            }
          }}
        />
      </div>

      {/* <input
        className="hidden"
        ref={mergeUploadRef}
        name="upload"
        type="file"
        accept="video/*"
        onChange={(e) => {
          videoSrcRef.current = e.target.files[0];
          setMainUrl(URL.createObjectURL(videoSrcRef.current));
          setTitle(videoSrcRef.current.name);
        }}
      /> */}
      {/* <div className="flex justify-center items-center w-full h-[200px] border-dashed border-4  rounded-md hover:bg-slate-400">
        <div
          className="flex flex-col justify-center items-center gap-3 "
          onMouseEnter={() => {
            if (!ishover) {
              setIsHover(true);
            }
          }}
          onMouseLeave={() => {
            if (ishover) {
              setIsHover(false);
            }
          }}
        >
          <PlusOutlined className="text-[50px]" />
          <h1 className="text-xl ">
            파일을 끌어올리거나 추가하기 버튼을 눌러주세요.
          </h1>
          <Button type="primary">추가하기</Button>
        </div>
      </div> */}
    </section>
  );
};

export default MergeControl;
