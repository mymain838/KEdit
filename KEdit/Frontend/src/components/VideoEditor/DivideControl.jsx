import { VideoCameraAddOutlined } from "@ant-design/icons";
import { Button, Form, Select, Slider } from "antd";
import { useRef, useState } from "react";
import ReactPlayer from "react-player";
import {
  download,
  formatTime,
  sliderValueToVideoTime,
} from "../../utils/helper";
import { transcodeFile, transcodeUrl } from "../../utils/transcoding";

const DivideControl = ({
  id,
  mainUrl,
  divideItem,
  setDivideItem,
  setProgress,
  setIsLoading,
  videoSrcRef,
}) => {
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
    const modifyData = divideItem.map((item) =>
      parseInt(item.id) === parseInt(id) ? { ...item, [key]: value } : item
    );
    setDivideItem(modifyData);
  };
  const updateState = (key, value) => {
    const modifyData = divideItem.map((item) =>
      parseInt(item.id) === parseInt(id)
        ? { ...item, playerState: { ...item.playerState, [key]: value } }
        : item
    );
    setDivideItem(modifyData);
  };
  const handleDelete = () => {
    const modifyData = divideItem.filter((item) => {
      return parseInt(item.id) !== parseInt(id);
    });
    setDivideItem(modifyData);
  };

  const handleDownload = async (e) => {
    let url = "undefined";

    if (typeof videoSrcRef.current === "string") {
      url = await transcodeUrl(
        playerState,
        sliderValues,
        setProgress,
        setIsLoading,
        videoSrcRef,
        { current: extension },
        quality,
        speed
      );
    } else {
      url = await transcodeFile(
        playerState,
        sliderValues,
        setProgress,
        setIsLoading,
        videoSrcRef,
        { current: extension },
        speed
      );
    }

    download(url);
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

        <div className="flex justify-center gap-10">
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
            handleSeek();
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
        {mainUrl ? (
          <ReactPlayer
            ref={playerRef}
            width={"100%"}
            height={300}
            url={mainUrl}
            controls={true}
            onDuration={(duration) => {
              // 총 시간 저장
              setPlayerState({ ...playerState, duration: duration });
              updateState("duration", duration);
            }}
            progressInterval={100}
            onProgress={({ playedSeconds, played }) => {
              console.log(playedSeconds);
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
        ) : (
          <div className="flex flex-col w-[200px] h-[200px] gap-2 justify-center items-center text-center">
            <VideoCameraAddOutlined className="text-[100px]" />
            <h4>비디오를 첨부해주세요</h4>
          </div>
        )}
      </div>
    </section>
  );
};
export default DivideControl;
