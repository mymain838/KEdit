import { VideoCameraAddOutlined } from "@ant-design/icons";
import { Button, Input, Popover, Radio, Slider, Switch, message } from "antd";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import Loading from "../components/Loading";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import {
  creatBlob,
  download,
  formatTime,
  sliderValueToVideoTime,
} from "../utils/helper";
import MainControl from "../components/VideoEditor/MainControl";
import { transcodeUrl } from "../utils/transcoding";
export const ffmpeg = createFFmpeg({
  log: true,
  arguments: ["-s", "ASSERTIONS=1"],
  TOTAL_MEMORY: 2048 * 1024 * 1024,
});

const VideoEditor = () => {
  // ffmpeg 진행상황 컨트롤
  const [progress, setProgress] = useState("");
  // 로딩 컨트롤
  const [isLoading, setIsLoading] = useState(false);
  // URL 인풋 값
  const [inputUrl, setInputUrl] = useState("");
  // 메인 화면 값
  const [mainUrl, setMainUrl] = useState("");
  // 실제  비디오 값(가공후)
  const [videoUrl, setVideoUrl] = useState("");
  const [ishover, setIsHover] = useState(false);
  const [isPro, setIsPro] = useState(false);
  //퀄리티 설정
  const [quality, setQuality] = useState("low");

  const [sliderValues, setSliderValues] = useState([0, 100]);

  const [playerState, setPlayerState] = useState({
    duration: 0,
    playedSeconds: 0,
  });

  // 비디오 경로(가공전)
  const videoSrc = useRef("");
  // ReactPlayer의 참조를 저장할 ref
  const playerRef = useRef(null);
  const firstUploadRef = useRef();
  const messageRef = useRef(null);
  const extensionRef = useRef("mp4");

  const handleUrl = async () => {
    if (!inputUrl) {
      message.error("URL 주소를 입력해주세요");
      return;
    } else if (!inputUrl.startsWith("https://")) {
      message.error("올바른 주소를 입력해주세요 예)https:// ...");
      return;
    }

    videoSrc.current = inputUrl;

    // if (mainUrl) {
    //   //이럴 경우가 없음 생각필요
    //   const url = await transcodeUrl(
    //     playerState,
    //     sliderValues,
    //     setProgress,
    //     setIsLoading,
    //     videoSrc,
    //     extensionRef,
    //     quality,
    //     mainUrl
    //   );

    //   setVideoUrl(url);
    // } else {
    setIsLoading(true);
    const blob = await creatBlob(inputUrl, quality);
    setMainUrl(URL.createObjectURL(blob));
    setIsLoading(false);
    // }
  };

  useEffect(() => {
    if (!ffmpeg.isLoaded()) {
      ffmpeg.load().then((Shar) => {});
    }
  }, []);

  return (
    <article className="flex flex-col gap-2 ">
      {isLoading && <Loading progress={progress} />}

      <article className="flex flex-col gap-2">
        <section className="flex justify-between">
          <input
            className="hidden"
            ref={firstUploadRef}
            name="upload"
            type="file"
            accept="video/*"
            onChange={(e) => {
              videoSrc.current = e.target.files[0];
              setMainUrl(URL.createObjectURL(videoSrc.current));
            }}
          />
          <span className="text-gray-400">Video Edit</span>
          {videoSrc.current && (
            <Button
              type="primary"
              onClick={() => {
                setVideoUrl("");
                setMainUrl("");
                videoSrc.current = "";
                setSliderValues([0, 100]);
              }}
            >
              비디오 재선택
            </Button>
          )}
        </section>

        <section>
          {mainUrl ? (
            <div className="flex flex-col justify-center items-center">
              <ReactPlayer
                ref={playerRef}
                width="100%"
                height={600}
                url={mainUrl}
                controls={true}
                onDuration={(duration) => {
                  // 총 시간 저장
                  setPlayerState({ ...playerState, duration: duration });
                }}
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

                  // 종료 지점
                  if (maxTime !== null && playedSeconds >= maxTime) {
                    playerRef.current.seekTo(minTime, "seconds");
                  }
                }}
              >
                {/* <source src={URL.createObjectURL(video)} />

            <BigPlayButton position="center" />
            <LoadingSpinner />
            <ControlBar disableCompletely></ControlBar> */}
              </ReactPlayer>
            </div>
          ) : (
            <div
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
              className="flex flex-col min-h-[600px] justify-center items-center bg-slate-400 cursor-pointer hover:bg-gray-700"
            >
              {ishover ? (
                <div className="flex flex-col gap-3">
                  <Popover
                    content={
                      <Input
                        className="w-[400px]"
                        value={inputUrl}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUrl();
                          }
                        }}
                        onChange={(e) => {
                          setInputUrl(e.target.value);
                        }}
                      />
                    }
                    title={
                      <div className="flex flex-col gap-2">
                        <div>
                          주소를 입력하고
                          <span className="text-blue-600">URL 입력하기</span>를
                          눌러주세요
                        </div>
                        <Radio.Group
                          value={quality}
                          onChange={(e) => {
                            setQuality(e.target.value);
                          }}
                          defaultValue={"low"}
                        >
                          <Radio value={"low"}>저화질</Radio>
                          <Radio value={"high"}>고화질</Radio>
                        </Radio.Group>
                      </div>
                    }
                  >
                    <Button type="primary" size="large" onClick={handleUrl}>
                      URL 입력하기
                    </Button>
                  </Popover>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                      firstUploadRef.current.click();
                    }}
                  >
                    파일 첨부하기
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 justify-center items-center">
                  <VideoCameraAddOutlined className="text-[100px]" />
                  <h4>비디오를 첨부해주세요</h4>
                </div>
              )}
            </div>
          )}
        </section>
      </article>

      {mainUrl && (
        <MainControl
          playerState={playerState}
          playerRef={playerRef}
          isPro={isPro}
          setIsPro={setIsPro}
          sliderValues={sliderValues}
          setSliderValues={setSliderValues}
          videoSrcRef={videoSrc}
          extensionRef={extensionRef}
          setVideoUrl={setVideoUrl}
          setProgress={setProgress}
          setIsLoading={setIsLoading}
          quality={quality}
          mainUrl={mainUrl}
        />
      )}
    </article>
  );
};

export default VideoEditor;
