export async function readFileText(file: File): Promise<string> {
  if (file.text) {
    return file.text();
  }
  return new Response(file).text();
}
