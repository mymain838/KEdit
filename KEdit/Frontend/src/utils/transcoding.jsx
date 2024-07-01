import { sliderValueToVideoTime } from "./helper";
import { ffmpeg } from "../pages/VideoEditor";
import { fetchFile } from "@ffmpeg/ffmpeg";

/*
  playerState : 플레이어 정보
  sliderValues : 슬라이더 범위 [0, 100]
  setIsLoading : 로딩 여부 설정
  ffmpeg, : ffmpeg 객체
  videoSrcRef, : 비디오 정보(가공전)
  extensionRef : 확장자 정보
  quality : 비디오 퀄리티 설정(URL 타입만 지원)
  mainUrl  : 메인 영상 정보(가공후)

*/
const extensionType = {
  mp4: "video",
  avi: "video",
  ogg: "video",
  webm: "video",
  gif: "image",
  mp3: "audio",
};

export const transcodeFile = async (
  playerState,
  sliderValues,
  setProgress,
  setIsLoading,
  videoSrcRef,
  extensionRef,
  speed = 1
) => {
  const inputFileName = "input.mp4";
  const [min, max] = sliderValues;
  const minTime = sliderValueToVideoTime(playerState.duration, min);
  const maxTime = sliderValueToVideoTime(playerState.duration, max);
  setIsLoading(true);

  // console.log(minTime);
  // console.log(maxTime);
  // console.log(PlayerState.duration);
  // console.log(min);
  // console.log(max);

  try {
    ffmpeg.FS("writeFile", inputFileName, await fetchFile(videoSrcRef.current));

    ffmpeg.setProgress(({ ratio }) => {
      setProgress(ratio * 100);
    });

    await ffmpeg.run(
      "-i",
      inputFileName,
      "-ss",
      `${minTime}`,
      "-to",
      `${maxTime}`,
      "-vf",
      `setpts=${1 / parseInt(speed)}*PTS`,
      "-af",
      `atempo=${parseInt(speed)}`,
      `output.${extensionRef.current}`
    );

    const data = ffmpeg.FS("readFile", `output.${extensionRef.current}`);
    const dataURL = URL.createObjectURL(
      new Blob([data.buffer], {
        type: `${extensionType[extensionRef.current]}/${extensionRef.current}`,
      })
    );

    setIsLoading(false);

    return dataURL;
  } catch (e) {
    alert(e);
    setIsLoading(false);
  }
};

export const transcodeUrl = async (
  playerState,
  sliderValues,
  setProgress,
  setIsLoading,
  videoSrcRef,
  extensionRef,
  quality,
  speed = 1
) => {
  //   ffmpeg.FS(
  //     "writeFile",
  //     inputFileName,
  //     await fetchFile(
  //       `https://vds-h285.onrender.com/download?url=${videoSrcRef.current}&quality=low`
  //     )
  //   );

  try {
    const inputFileName = "input.mp4";
    const [min, max] = sliderValues;
    console.log(speed);
    const minTime = sliderValueToVideoTime(playerState.duration, min);
    const maxTime = sliderValueToVideoTime(playerState.duration, max);

    setIsLoading(true);

    ffmpeg.FS(
      "writeFile",
      inputFileName,
      await fetchFile(
        `https://kedit.onrender.com/download?url=${videoSrcRef.current}&quality=${quality}`
      )
    );

    ffmpeg.setProgress(({ ratio }) => {
      if (ratio * 100 > 0) {
        setProgress(ratio * 100);
      }
    });

    await ffmpeg.run(
      "-i",
      inputFileName,
      "-ss",
      `${minTime}`,
      "-to",
      `${maxTime}`,
      "-vf",
      `setpts=${1 / parseInt(speed)}*PTS`,
      "-af",
      `atempo=${parseInt(speed)}`,
      `output.${extensionRef.current}`
    );

    const data = ffmpeg.FS("readFile", `output.${extensionRef.current}`);

    const dataURL = URL.createObjectURL(
      new Blob([data.buffer], {
        type: `${extensionType[extensionRef.current]}/${extensionRef.current}`,
      })
    );
    setIsLoading(false);

    return dataURL;
  } catch (e) {
    alert(e);
    setIsLoading(false);
  }
};
