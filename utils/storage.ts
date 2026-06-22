export async function uploadFilesToStorage(files: File[], path: string): Promise<string[]> {
  // Mock upload logic that returns local URLs
  return files.map(file => URL.createObjectURL(file));
}
