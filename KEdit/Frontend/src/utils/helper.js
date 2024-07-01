import { message } from "antd";
import { fetchArrayBuffer } from "../api/api,js";

export const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

// export const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

export const readFileAsBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const download = (url) => {
  console.log(url);
  if (url !== "undefined") {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "");
    link.click();
    message.success("성공적으로 파일을 내보냈습니다.");
  }
};

export function sliderValueToVideoTime(duration, sliderValue) {
  return (duration * sliderValue) / 100;
}

export function formatTime(seconds) {
  // 소수점 이하 버리기
  seconds = Math.floor(seconds);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // 시간, 분, 초를 각각 두 자리로 만들기
  const formattedHours = hours > 0 ? `${hours}:` : "";
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
}

export async function creatBlob(url, quality) {
  const data = await fetchArrayBuffer(url, quality);
  const base64 = data.base64;

  // Convert base64 to binary string
  const binaryString = atob(base64);

  // Convert binary string to array buffer
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert array buffer to blob
  const blob = new Blob([bytes], { type: "video/mp4" });

  return blob;
}
