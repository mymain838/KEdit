const express = require("express");
const { alldown } = require("nayan-media-downloader");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

// CORS 설정 기본적인 CORS정책(모든 출처에 대해 모든 HTTP 메소드를 허용)
app.use(cors());

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: ["GET"],
//     allowedHeaders: ["*"],
//   })
// );

app.get("/download", async (req, res) => {
  const { url, quality } = req.query;

  if (!url) {
    console.error("No URL provided");
    return res.status(400).send("No URL provided");
  }

  try {
    const result = await alldown(url);

    if (!result.status) {
      console.error("Error in down response:", result);
      return res.status(500).send("Error processing URL");
    }

    const content = result.media || result.data;
    const type = quality === "high" ? content.high : content.low;

    // Streaming the video to the client
    const response = await axios({
      url: type,
      method: "GET",
      responseType: "stream",
    });

    res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
    res.setHeader("Content-Type", "video/mp4");

    response.data.pipe(res);
  } catch (error) {
    console.error("Error processing URL:", error);
    res.status(500).send("Error processing URL");
  }
});

app.get("/blob", async (req, res) => {
  const { url, quality } = req.query;

  if (!url) {
    console.error("No URL provided");
    return res.status(400).send("No URL provided");
  }

  try {
    const result = await alldown(url);

    if (!result.status) {
      console.error("Error in down response:", result);
      return res.status(500).send("Error processing URL");
    }

    const content = result.media || result.data;
    const type = quality === "high" ? content.high : content.low;

    // Streaming the video to the client
    const response = await axios({
      url: type,
      method: "GET",
      responseType: "arraybuffer",
    });

    // Converting arraybuffer to base64
    const base64Data = Buffer.from(response.data, "binary").toString("base64");

    // Sending base64 encoded data
    res.json({ base64: base64Data });
  } catch (error) {
    console.error("Error processing URL:", error);
    res.status(500).send("Error processing URL");
  }
});

app.get("/meta", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    console.error("No URL provided");
    return res.status(400).send("No URL provided");
  }

  try {
    const result = await alldown(url);

    if (!result.status) {
      console.error("Error in down response:", result);
      return res.status(500).send("Error processing URL");
    }

    const content = result.media || result.data;
    const title = content.title;

    res.json({ title });
  } catch (error) {
    console.error("Error processing URL:", error);
    res.status(500).send("Error processing URL");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
