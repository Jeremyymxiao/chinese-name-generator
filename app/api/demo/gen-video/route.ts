export const runtime = 'edge';

import { respData, respErr } from "@/lib/resp";
import { JSONValue } from "ai";
import type { VideoModelV1 } from "@/aisdk/provider";
import { generateVideo } from "@/aisdk";
import { kling } from "@/aisdk/kling";

export async function POST(req: Request) {
  try {
    const { prompt, provider, model } = await req.json();
    if (!prompt || !provider || !model) {
      return respErr("invalid params");
    }

    let videoModel: VideoModelV1;
    let providerOptions: Record<string, Record<string, JSONValue>> = {};

    switch (provider) {
      case "kling":
        videoModel = kling.video(model);
        providerOptions = {
          kling: {
            mode: "std",
            duration: 5,
          },
        };
        break;
      default:
        return respErr("invalid provider");
    }

    const { videos, warnings } = await generateVideo({
      model: videoModel,
      prompt: prompt,
      n: 1,
      providerOptions,
    });

    if (warnings.length > 0) {
      console.log("gen videos warnings:", provider, warnings);
      return respErr("gen videos failed");
    }

    // 直接返回 base64 视频数据
    return respData(videos.map(video => ({
      provider,
      base64: video.base64,
    })));
  } catch (err) {
    console.log("gen video failed:", err);
    return respErr("gen video failed");
  }
}
