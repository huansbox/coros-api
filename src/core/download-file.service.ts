import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DownloadFile {
  private readonly logger = new Logger(DownloadFile.name);
  private readonly httpService: HttpService;

  constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  async handle(url: string, directory: string, fileName: string): Promise<void> {
    // Windows/macOS cannot create files whose names contain these characters.
    // COROS structured-workout names auto-include them (pace "@4:25", reps
    // "30x20/100"), which made the local write silently fail. Sanitize before
    // saving — the download URL is keyed by labelId, so the name is cosmetic.
    const safeFileName = fileName.replace(/[<>:"/\\|?*]/g, '_');
    this.logger.log(`Downloading ${safeFileName}`);
    const response = await this.httpService.axiosRef.get(url, {
      responseType: 'stream',
    });

    await pipeline(response.data, fs.createWriteStream(path.join(directory, safeFileName)));
  }
}
