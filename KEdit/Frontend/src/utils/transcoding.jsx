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
  try {
    const inputFileName = "input.mp4";
    const [min, max] = sliderValues;

    const minTime = sliderValueToVideoTime(playerState.duration, min);
    const maxTime = sliderValueToVideoTime(playerState.duration, max);

    setIsLoading(true);

    ffmpeg.FS(
      "writeFile",
      inputFileName,
      await fetchFile(
        `https://kedit.onrender.com/download?url=${videoSrcRef.current}&quality=${quality}`
      )
      // await fetchFile(
      //   `http://localhost:3000/download?url=${videoSrcRef.current}&quality=${quality}`
      // )
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

export const transcodeDivide = async (
  setProgress,
  setIsLoading,
  divideItem,
  extension
) => {
  try {
    setIsLoading(true);

    for (const item of divideItem) {
      const src =
        typeof item.videoSrc === "string"
          ? `https://kedit.onrender.com/download?url=${item.videoSrc}`
          : item.videoSrc;
      const minTime = sliderValueToVideoTime(
        item.playerState.duration,
        item.sliderValues[0]
      );
      const maxTime = sliderValueToVideoTime(
        item.playerState.duration,
        item.sliderValues[1]
      );

      ffmpeg.FS("writeFile", `input${item.id}.mp4`, await fetchFile(src));

      ffmpeg.setProgress(({ ratio }) => {
        if (ratio * 100 > 0) {
          setProgress(ratio * 100);
        }
      });

      await ffmpeg.run(
        "-i",
        `input${item.id}.mp4`,
        "-ss",
        `${minTime}`,
        "-to",
        `${maxTime}`,
        "-vf",
        `setpts=${1 / parseInt(item.speed)}*PTS`,
        "-af",
        `atempo=${parseInt(item.speed)}`,
        `output${item.id}.mp4`
      );
    }

    let concatList = "concatList.txt";
    let listContent = divideItem
      .map((item) => `file 'output${item.id}.mp4'`)
      .join("\n");
    ffmpeg.FS("writeFile", concatList, listContent);

    await ffmpeg.run(
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatList,
      "-c",
      "copy",
      `final_output.${extension}`
    );

    const data = ffmpeg.FS("readFile", `final_output.${extension}`);
    const dataUrl = URL.createObjectURL(
      new Blob([data.buffer], { type: `video/${extension}` })
    );

    setIsLoading(false);
    return dataUrl;
  } catch (e) {
    alert(e);
  }
};

export const transcodeFilter = async (
  videoSrc,
  extension,
  text,
  textSize,
  textColor,
  textPosition,
  hue,
  bright,
  setIsLoading,
  setProgress
) => {
  const positions = {
    "10,10": "x=10:y=10",
    "W-tw-10,10": "x=W-tw-10:y=10",
    "(W-tw)/2,(H-th)/2": "x=(W-tw)/2:y=(H-th)/2",
    "10,H-th-10": "x=10:y=H-th-10",
    "W-tw-10,H-th-10": "x=W-tw-10:y=H-th-10",
  };

  try {
    setIsLoading(true);
    console.log(textPosition);
    const src =
      typeof videoSrc === "string"
        ? `https://kedit.onrender.com/download?url=${videoSrcRef.current}&quality=${quality}`
        : videoSrc;

    // const src =
    //   typeof videoSrc === "string"
    //     ? `http://localhost:3000/download?url=${videoSrc}`
    //     : videoSrc;

    ffmpeg.FS("writeFile", `input.mp4`, await fetchFile(src));

    ffmpeg.setProgress(({ ratio }) => {
      if (ratio * 100 > 0) {
        setProgress(ratio * 100);
      }
    });
    // 버전 이슈

    await ffmpeg.FS(
      "writeFile",
      "NotoSansKR.ttf",
      await fetchFile(
        "https://raw.githubusercontent.com/mymain838/KEdit/main/KEdit/Frontend/src/font/NotoSansKR-VariableFont_wght.ttf"
      )
    );

    await ffmpeg.run(
      "-i",
      `input.mp4`,
      "-vf",
      `drawtext=text='${text}':fontfile=/NotoSansKR.ttf:fontsize=${textSize}:fontcolor=${textColor}:${positions[textPosition]},eq=brightness=${bright}:saturation=${hue}`,
      `output.${extension}`
    );
    const data = ffmpeg.FS("readFile", `output.${extension}`);

    const dataUrl = URL.createObjectURL(
      new Blob([data.buffer], { type: `video/${extension}` })
    );

    setIsLoading(false);
    return dataUrl;
  } catch (e) {
    alert(e);
  }
};
