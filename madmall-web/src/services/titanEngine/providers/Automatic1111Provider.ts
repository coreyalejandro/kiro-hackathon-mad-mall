import axios from 'axios';
import { CONFIG } from '../config.js';
import fs from 'fs';
import path from 'path';

export async function generateWithAutomatic1111(prompt: string, count: number): Promise<string[]> {
  if (!CONFIG.SD_WEBUI_URL) throw new Error('SD_WEBUI_URL is not set');
  const savedPaths: string[] = [];
  for (let i=0; i<count; i++) {
    const resp = await axios.post(`${CONFIG.SD_WEBUI_URL}/sdapi/v1/txt2img`, {
      prompt,
      steps: 25,
      width: 768,
      height: 512
    }, { timeout: 120000 });
    const b64 = resp.data.images?.[0];
    if (!b64) continue;
    const buffer = Buffer.from(b64, 'base64');
    const filename = `sd_${Date.now()}_${i}.png`;
    const outPath = path.join('public','images', filename);
    fs.writeFileSync(outPath, buffer);
    savedPaths.push(outPath);
  }
  return savedPaths;
}
