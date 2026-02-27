import { open } from '@tauri-apps/plugin-dialog';
import { writeFile, BaseDirectory, exists, mkdir, readFile } from '@tauri-apps/plugin-fs';
import { generateId } from './storage';

// 确保照片目录存在
async function ensurePhotoDir() {
  const dirExists = await exists('photos', { baseDir: BaseDirectory.AppData });
  if (!dirExists) {
    await mkdir('photos', { baseDir: BaseDirectory.AppData, recursive: true });
  }
}

// 选择照片文件
export async function selectPhotos(): Promise<string[]> {
  const selected = await open({
    multiple: true,
    filters: [{
      name: 'Images',
      extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp']
    }]
  });

  console.log('[photo] selected:', selected);

  if (!selected) return [];

  const files = Array.isArray(selected) ? selected : [selected];
  console.log('[photo] files to process:', files);

  return await savePhotos(files);
}

// 拍照
export async function takePhoto(): Promise<string[]> {
  // 在 Android 上，使用 directory: false 会触发系统的文件选择器
  // 用户可以选择"相机"选项来拍照
  const selected = await open({
    multiple: false,
    filters: [{
      name: 'Images',
      extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp']
    }]
  });

  console.log('[photo] camera selected:', selected);

  if (!selected) return [];

  const files = Array.isArray(selected) ? selected : [selected];
  return await savePhotos(files);
}

// 保存照片到 AppData
async function savePhotos(files: string[]): Promise<string[]> {
  await ensurePhotoDir();
  const savedPaths: string[] = [];

  for (const file of files) {
    // Android 返回 content URI，不能直接从路径提取扩展名
    let ext = 'jpg';
    if (!file.startsWith('content://')) {
      ext = file.split('.').pop() || 'jpg';
    }
    const newFileName = `${generateId()}.${ext}`;
    const destPath = `photos/${newFileName}`;

    try {
      console.log('[photo] reading file:', file);
      const data = await readFile(file);
      console.log('[photo] read success, size:', data.byteLength);
      await writeFile(destPath, data, { baseDir: BaseDirectory.AppData });
      console.log('[photo] written to:', destPath);
      savedPaths.push(destPath);
    } catch (error) {
      console.error('[photo] failed to save photo:', file, error);
      alert(`保存照片失败: ${error}`);
    }
  }

  console.log('[photo] savedPaths:', savedPaths);
  return savedPaths;
}

// 获取照片的缩略图 URL（压缩后）
export async function getThumbnailUrl(photoPath: string): Promise<string> {
  const data = await readFile(photoPath, { baseDir: BaseDirectory.AppData });
  const ext = photoPath.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  // 创建 blob URL 加载到 Image
  const blob = new Blob([data], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // 缩略图最大 300px
      const maxSize = 300;
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) { height = height * maxSize / width; width = maxSize; }
      } else {
        if (height > maxSize) { width = width * maxSize / height; height = maxSize; }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(blobUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = blobUrl;
  });
}

// 获取照片的显示 URL（原图）
export async function getPhotoUrl(photoPath: string): Promise<string> {
  const data = await readFile(photoPath, { baseDir: BaseDirectory.AppData });
  const ext = photoPath.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const blob = new Blob([data], { type: mimeType });
  return URL.createObjectURL(blob);
}

