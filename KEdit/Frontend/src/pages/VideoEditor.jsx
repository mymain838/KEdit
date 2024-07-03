import { PlusOutlined, VideoCameraAddOutlined } from "@ant-design/icons";
import {
  Button,
  Input,
  Popover,
  Radio,
  Slider,
  Switch,
  Tabs,
  message,
} from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import Loading from "../components/Loading";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import { creatBlob, download, sliderValueToVideoTime } from "../utils/helper";
import MainControl from "../components/VideoEditor/MainControl";
import { fetchTitle } from "../api/api,js";
import { LoginContext } from "../App";
import DivideControl from "../components/VideoEditor/DivideControl";
import { transcodeFile, transcodeUrl } from "../utils/transcoding";
import DivideModal from "../components/VideoEditor/DivideModal";
import MergeControl from "../components/VideoEditor/MergeControl";
import MergeModal from "../components/VideoEditor/MergeModal";
import FilterControl from "../components/VideoEditor/FilterControl";
export const ffmpeg = createFFmpeg({ log: true });

const VideoEditor = () => {
  // ffmpeg 진행상황 컨트롤
  const [progress, setProgress] = useState("");
  // 로딩 컨트롤
  const [isLoading, setIsLoading] = useState(false);

  const [isDivideModalOpen, setIsDivideModalOpen] = useState(false);

  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  //제목
  const [title, setTitle] = useState("");
  // URL 인풋 값
  const [inputUrl, setInputUrl] = useState("");
  // 메인 화면 Output값
  const [mainUrl, setMainUrl] = useState("");
  // 비디오 Output값
  const [videoUrl, setVideoUrl] = useState("");
  // main 호버 여부
  const [ishover, setIsHover] = useState(false);
  // merge 업로드부분 호버 여부
  const [isMergeHover, setIsMergeHover] = useState(false);

  const [isPro, setIsPro] = useState(false);
  //퀄리티 설정
  const [quality, setQuality] = useState("low");
  // 슬라이더 값
  const [sliderValues, setSliderValues] = useState([0, 100]);

  const [divideItem, setDivideItem] = useState([]);

  const [mergeItem, setMergeItem] = useState([]);

  // 플레이어 상태
  const [playerState, setPlayerState] = useState({
    duration: 0,
    playedSeconds: 0,
  });

  // 로그인 컨텍스트
  const [isLogin] = useContext(LoginContext);

  // 비디오 경로
  const videoSrcRef = useRef("");
  // 비디오 경로
  const mergeSrcRef = useRef("");
  // ReactPlayer의 참조를 저장할 ref
  const playerRef = useRef(null);
  // input 과 업로드 버튼 연동 할 ref
  const firstUploadRef = useRef();

  const mergeUploadRef = useRef();
  //확장자 ref
  const extensionRef = useRef("mp4");

  //Divide Ref
  const divideIdRef = useRef(0);
  //Merge Ref
  const mergeIdRef = useRef(0);

  const tabsItem = [
    {
      label: `나누기`,
      key: "divide",
      children: (
        <article>
          {divideItem.map((item) => (
            <DivideControl
              key={item.id}
              id={item.id}
              divideItem={divideItem}
              setDivideItem={setDivideItem}
              mainUrl={mainUrl}
              setProgress={setProgress}
              setIsLoading={setIsLoading}
              videoSrcRef={videoSrcRef}
            />
          ))}

          <div className="flex gap-2 justify-center items-center">
            <Button
              className="mt-3 flex-grow"
              type="primary"
              size="large"
              onClick={() => {
                divideIdRef.current += 1;
                setDivideItem([
                  ...divideItem,
                  {
                    id: divideIdRef.current,
                    name: "output",
                    speed: "1",
                    quality: "low",
                    extension: "mp4",
                    sliderValues: [0, 100],
                    videoSrc: videoSrcRef.current,
                    playerState: {
                      duration: 0,
                      playedSeconds: 0,
                    },
                  },
                ]);
              }}
            >
              추가하기
            </Button>
            {divideItem.length > 0 && (
              <Button
                className="mt-3 flex-grow"
                type="primary"
                size="large"
                onClick={async () => {
                  for (const item of divideItem) {
                    let url = "undefined";

                    if (typeof videoSrcRef.current === "string") {
                      url = await transcodeUrl(
                        item.playerState,
                        item.sliderValues,
                        setProgress,
                        setIsLoading,
                        videoSrcRef,
                        { current: item.extension },
                        item.quality,
                        item.speed
                      );
                    } else {
                      url = await transcodeFile(
                        item.playerState,
                        item.sliderValues,
                        setProgress,
                        setIsLoading,
                        videoSrcRef,
                        { current: item.extension },
                        item.speed
                      );
                    }

                    download(url, item.name, item.extension);
                  }
                }}
              >
                일괄 받기
              </Button>
            )}
            {divideItem.length > 1 && (
              <Button
                className="mt-3 flex-grow"
                type="primary"
                size="large"
                onClick={() => {
                  setIsDivideModalOpen(true);
                }}
              >
                합치기
              </Button>
            )}
          </div>
        </article>
      ),
    },

    {
      label: `다중 병합`,
      key: "merge",
      children: (
        <article>
          {mergeItem.map((item) => (
            <MergeControl
              key={item.id}
              id={item.id}
              isMain={item.isMain}
              mergeItem={mergeItem}
              setMergeItem={setMergeItem}
              setProgress={setProgress}
              setIsLoading={setIsLoading}
              mainVideoSrc={videoSrcRef.current}
              mergevideoSrc={item.videoSrc}
            />
          ))}
          <div
            className="flex justify-center items-center w-full h-[200px] border-dashed border-4  rounded-md hover:bg-slate-400 hover:cursor-copy"
            onMouseEnter={() => {
              if (!isMergeHover) {
                setIsMergeHover(true);
              }
            }}
            onMouseLeave={() => {
              if (isMergeHover) {
                setIsMergeHover(false);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              mergeIdRef.current += 1;
              mergeSrcRef.current = e.dataTransfer.files[0];
              setMergeItem([
                ...mergeItem,
                {
                  id: mergeIdRef.current,
                  isMain: false,
                  name: "output",
                  speed: "1",
                  quality: "low",
                  extension: "mp4",
                  sliderValues: [0, 100],
                  videoSrc: mergeSrcRef.current, // ?? 확인필요
                  playerState: {
                    duration: 0,
                    playedSeconds: 0,
                  },
                },
              ]);
              e.dataTransfer.clearData();
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex flex-col justify-center items-center gap-3 ">
              <PlusOutlined className="text-[50px]" />
              <h1 className="text-xl ">
                파일을 끌어올리거나 추가하기 버튼을 눌러주세요.
              </h1>
              {isMergeHover && (
                <Button
                  type="primary"
                  onClick={() => {
                    mergeUploadRef.current.click();
                  }}
                >
                  추가하기
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-center items-center">
            {mergeItem.length > 1 && (
              <Button
                className="mt-3 flex-grow"
                type="primary"
                size="large"
                onClick={() => {
                  setIsMergeModalOpen(true);
                }}
              >
                합치기
              </Button>
            )}
          </div>
        </article>
      ),
    },
    {
      label: `필터`,
      key: "filter",
      children: (
        <FilterControl
          videoSrcRef={videoSrcRef}
          mainUrl={mainUrl}
          setMainUrl={setMainUrl}
          setIsLoading={setIsLoading}
          setProgress={setProgress}
        />
      ),
    },
  ];

  const handleUrl = async () => {
    if (!inputUrl) {
      message.error("URL 주소를 입력해주세요");
      return;
    } else if (!inputUrl.startsWith("https://")) {
      message.error("올바른 주소를 입력해주세요 예)https:// ...");
      return;
    }

    videoSrcRef.current = inputUrl;

    // if (mainUrl) {
    //   //이럴 경우가 없음 생각필요
    //   const url = await transcodeUrl(
    //     playerState,
    //     sliderValues,
    //     setProgress,
    //     setIsLoading,
    //     videoSrcRef,
    //     extensionRef,
    //     quality,
    //     mainUrl
    //   );

    //   setVideoUrl(url);
    // } else {
    setIsLoading(true);
    const blob = await creatBlob(inputUrl, quality);
    setMainUrl(URL.createObjectURL(blob));

    mergeIdRef.current += 1;

    setMergeItem([
      {
        id: mergeIdRef.current,
        isMain: true,
        name: "output",
        speed: "1",
        quality: "low",
        extension: "mp4",
        sliderValues: [0, 100],
        videoSrc: blob,
        playerState: {
          duration: 0,
          playedSeconds: 0,
        },
      },
      ...mergeItem,
    ]);

    const title = await fetchTitle(videoSrcRef.current);
    setTitle(title);
    setIsLoading(false);
    // }
  };

  useEffect(() => {
    if (!ffmpeg.isLoaded()) {
      ffmpeg.load().then((Shar) => {});
    }
  }, []);
  console.log(mainUrl);
  return (
    <article className="flex flex-col gap-2 ">
      {isLoading && <Loading progress={progress} />}

      <input
        className="hidden"
        ref={firstUploadRef}
        name="upload"
        type="file"
        accept="video/*"
        onChange={(e) => {
          videoSrcRef.current = e.target.files[0];
          setMainUrl(URL.createObjectURL(videoSrcRef.current));

          mergeIdRef.current += 1;
          setMergeItem([
            {
              id: mergeIdRef.current,
              isMain: true,
              name: "output",
              speed: "1",
              quality: "low",
              extension: "mp4",
              sliderValues: [0, 100],
              videoSrc: videoSrcRef.current,
              playerState: {
                duration: 0,
                playedSeconds: 0,
              },
            },
            ...mergeItem,
          ]);
          setTitle(videoSrcRef.current.name);
        }}
      />

      <input
        className="hidden"
        ref={mergeUploadRef}
        name="mergeUpload"
        type="file"
        accept="video/*"
        onChange={(e) => {
          mergeIdRef.current += 1;
          mergeSrcRef.current = e.target.files[0];
          setMergeItem([
            ...mergeItem,
            {
              id: mergeIdRef.current,
              name: "output",
              speed: "1",
              quality: "low",
              extension: "mp4",
              sliderValues: [0, 100],
              videoSrc: mergeSrcRef.current,
              playerState: {
                duration: 0,
                playedSeconds: 0,
              },
            },
          ]);
          mergeUploadRef.current.value = null;
        }}
      />
      <article className="flex flex-col gap-2">
        <section className="flex justify-between">
          <span className="text-gray-400">Video Edit</span>
          {videoSrcRef.current && (
            <Button
              type="primary"
              onClick={() => {
                setVideoUrl("");
                setMainUrl("");
                setTitle("");
                setDivideItem([]);
                setMergeItem([]);
                videoSrcRef.current = "";
                mergeSrcRef.current = "";
                mergeIdRef.current = 1;
                divideIdRef.current = 1;

                setSliderValues([0, 100]);
              }}
            >
              비디오 재선택
            </Button>
          )}
        </section>

        <section>
          {mainUrl ? (
            <div className="flex flex-col justify-center items-center text-center">
              <h1 className="text-xl font-bold mt-2 ">{title}</h1>
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

                  // 종료 지점
                  if (maxTime !== null && playedSeconds >= maxTime) {
                    playerRef.current.seekTo(minTime, "seconds");
                  }
                }}
              ></ReactPlayer>
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
          videoSrcRef={videoSrcRef}
          extensionRef={extensionRef}
          setVideoUrl={setVideoUrl}
          setProgress={setProgress}
          setIsLoading={setIsLoading}
          quality={quality}
          mainUrl={mainUrl}
        />
      )}

      {mainUrl &&
        isPro &&
        (isLogin ? (
          <Tabs defaultActiveKey="divide" centered items={tabsItem} />
        ) : (
          <div>로그인 해라</div>
        ))}

      {isDivideModalOpen && (
        <DivideModal
          setProgress={setProgress}
          setIsLoading={setIsLoading}
          divideItems={divideItem}
          setDivideItems={setDivideItem}
          isDivideModalOpen={isDivideModalOpen}
          setIsDivideModalOpen={setIsDivideModalOpen}
          videoSrcRef={videoSrcRef}
        />
      )}
      {isMergeModalOpen && (
        <MergeModal
          setProgress={setProgress}
          setIsLoading={setIsLoading}
          mergeItems={mergeItem}
          setMergeItems={setMergeItem}
          isMergeModalOpen={isMergeModalOpen}
          setIsMergeModalOpen={setIsMergeModalOpen}
        />
      )}
    </article>
  );
};

export default VideoEditor;
