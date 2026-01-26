import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

export class ImageOptimizer {
  private static readonly THUMBNAIL_SIZES = {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 },
  };

  /**
   * Optimize an image file
   */
  static async optimizeImage(
    inputPath: string,
    outputPath: string,
    options: ImageOptimizationOptions = {}
  ): Promise<void> {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
    } = options;

    let pipeline = sharp(inputPath);

    // Resize if dimensions provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'cover',
        position: 'center',
      });
    }

    // Apply format-specific optimizations
    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality, progressive: true });
        break;
      case 'png':
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
    }

    await pipeline.toFile(outputPath);
  }

  /**
   * Generate multiple thumbnail sizes
   */
  static async generateThumbnails(
    inputPath: string,
    outputDir: string,
    basename: string
  ): Promise<{ small: string; medium: string; large: string }> {
    await fs.mkdir(outputDir, { recursive: true });

    const thumbnails = {
      small: path.join(outputDir, `${basename}-sm.webp`),
      medium: path.join(outputDir, `${basename}-md.webp`),
      large: path.join(outputDir, `${basename}-lg.webp`),
    };

    await Promise.all([
      this.optimizeImage(inputPath, thumbnails.small, {
        ...this.THUMBNAIL_SIZES.small,
        format: 'webp',
      }),
      this.optimizeImage(inputPath, thumbnails.medium, {
        ...this.THUMBNAIL_SIZES.medium,
        format: 'webp',
      }),
      this.optimizeImage(inputPath, thumbnails.large, {
        ...this.THUMBNAIL_SIZES.large,
        format: 'webp',
      }),
    ]);

    return thumbnails;
  }

  /**
   * Get image metadata
   */
  static async getMetadata(imagePath: string) {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
    };
  }

  /**
   * Convert image to WebP
   */
  static async convertToWebP(
    inputPath: string,
    outputPath: string,
    quality = 80
  ): Promise<void> {
    await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);
  }

  /**
   * Create responsive image set
   */
  static async createResponsiveSet(
    inputPath: string,
    outputDir: string,
    basename: string
  ): Promise<{ [key: string]: string }> {
    await fs.mkdir(outputDir, { recursive: true });

    const sizes = [320, 640, 768, 1024, 1280, 1920];
    const images: { [key: string]: string } = {};

    await Promise.all(
      sizes.map(async width => {
        const filename = `${basename}-${width}w.webp`;
        const outputPath = path.join(outputDir, filename);
        
        await this.optimizeImage(inputPath, outputPath, {
          width,
          format: 'webp',
        });
        
        images[`${width}w`] = outputPath;
      })
    );

    return images;
  }

  /**
   * Compress image without resizing
   */
  static async compress(
    inputPath: string,
    outputPath: string,
    quality = 80
  ): Promise<{ originalSize: number; compressedSize: number; savings: string }> {
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size;

    await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);

    const compressedStats = await fs.stat(outputPath);
    const compressedSize = compressedStats.size;
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    return {
      originalSize,
      compressedSize,
      savings: `${savings}%`,
    };
  }
}
