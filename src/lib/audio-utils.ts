import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { writeFile, unlink, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const PREVIEW_DURATION_SECONDS = 30;

export async function trimAudioPreview(
  audioFile: File,
  outputFormat: "mp3" | "wav" | "aiff" | "flac" = "mp3"
): Promise<Buffer> {
  const inputPath = join(tmpdir(), `input-${randomUUID()}`);
  const outputPath = join(tmpdir(), `output-${randomUUID()}.${outputFormat}`);

  try {
    const arrayBuffer = await audioFile.arrayBuffer();
    await writeFile(inputPath, Buffer.from(arrayBuffer));

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(0)
        .setDuration(PREVIEW_DURATION_SECONDS)
        .audioCodec(outputFormat === "mp3" ? "libmp3lame" : "copy")
        .audioBitrate("192k")
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .save(outputPath);
    });

    const outputBuffer = await readFile(outputPath);
    return outputBuffer;
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}
