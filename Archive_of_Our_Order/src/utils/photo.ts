import { open } from '@tauri-apps/plugin-dialog';
import { copyFile, BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';
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

  if (!selected) return [];

  // 如果是单个文件，转换为数组
  const files = Array.isArray(selected) ? selected : [selected];

  // 复制文件到应用数据目录
  await ensurePhotoDir();
  const savedPaths: string[] = [];

  for (const file of files) {
    const ext = file.path.split('.').pop();
    const newFileName = `${generateId()}.${ext}`;
    const destPath = `photos/${newFileName}`;

    try {
      await copyFile(file.path, destPath, {
        fromPathBaseDir: undefined,
        toPathBaseDir: BaseDirectory.AppData
      });
      savedPaths.push(destPath);
    } catch (error) {
      console.error('Failed to copy photo:', error);
    }
  }

  return savedPaths;
}

// 获取照片的完整路径（用于显示）
export function getPhotoUrl(photoPath: string): string {
  // 在 Tauri 中，使用 convertFileSrc 来获取可以在 img 标签中使用的 URL
  return `appdata:///${photoPath}`;
}
