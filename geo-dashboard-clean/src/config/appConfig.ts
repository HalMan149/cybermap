export function getMoonImageUrl(): string | null {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_MOON_IMAGE_URL) {
    return process.env.NEXT_PUBLIC_MOON_IMAGE_URL as string;
  }
  return null;
}


