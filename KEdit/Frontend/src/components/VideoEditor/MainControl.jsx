import { useState } from "react";
import {
  download,
  formatTime,
  sliderValueToVideoTime,
} from "../../utils/helper";
import { Button, Slider, Switch } from "antd";
import { transcodeFile, transcodeUrl } from "../../utils/transcoding";

const MainControl = ({
  playerState,
  playerRef,
  sliderValues,
  setSliderValues,
  setIsPro,
  isPro,
  videoSrcRef,
  extensionRef,
  setVideoUrl,
  setProgress,
  setIsLoading,
  quality,
  mainUrl,
}) => {
  const handleDownload = async (e) => {
    let url = "undefined";
    if (!videoSrcRef.current) {
      message.error("먼저 비디오를 첨부해주세요");
      return;
    }
    extensionRef.current = e.target.closest(".button").name;

    if (typeof videoSrcRef.current === "string") {
      url = await transcodeUrl(
        playerState,
        sliderValues,
        setProgress,
        setIsLoading,
        videoSrcRef,
        extensionRef,
        quality,
        mainUrl
      );
    } else {
      url = await transcodeFile(
        playerState,
        sliderValues,
        setProgress,
        setIsLoading,
        videoSrcRef,
        extensionRef
      );
    }

    setVideoUrl(url);
    download(url);
  };

  const handleSeek = () => {
    if (playerRef.current) {
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

  return (
    <section className="flex flex-col items-center">
      <div className="font-semibold">
        <span className="text-gray-500">재생시간: </span>
        {formatTime(playerState.playedSeconds)}초
      </div>

      <div className="w-full">
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

      <div className="flex justify-between items-center w-full gap-2">
        <Button
          className="button flex-grow"
          type="primary"
          size="large"
          name="gif"
          onClick={handleDownload}
        >
          GIF 내보내기
        </Button>
        <Button
          className="button flex-grow"
          type="primary"
          size="large"
          name="mp3"
          onClick={handleDownload}
        >
          음성 내보내기
        </Button>
        <Button
          className="button flex-grow"
          type="primary"
          size="large"
          name="mp4"
          onClick={handleDownload}
        >
          영상 내보내기
        </Button>

        <Switch
          unCheckedChildren="Basic"
          checkedChildren="Pro"
          value={isPro}
          onChange={(value) => setIsPro(!isPro)}
        ></Switch>
      </div>
    </section>
  );
};

export default MainControl;
