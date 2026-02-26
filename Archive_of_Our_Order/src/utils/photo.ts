import { open } from '@tauri-apps/plugin-dialog';
import { writeFile, BaseDirectory, exists, mkdir, readFile } from '@tauri-apps/plugin-fs';
import { convertFileSrc } from '@tauri-apps/api/core';
import { appDataDir } from '@tauri-apps/api/path';
import { generateId } from './storage';

let _appDataDir: string | null = null;

async function getAppDataDir(): Promise<string> {
  if (!_appDataDir) {
    _appDataDir = await appDataDir();
  }
  return _appDataDir;
}

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

// 获取照片的显示 URL
export async function getPhotoUrl(photoPath: string): Promise<string> {
  const dir = await getAppDataDir();
  const separator = dir.endsWith('/') || dir.endsWith('\\') ? '' : '/';
  return convertFileSrc(`${dir}${separator}${photoPath}`);
}

