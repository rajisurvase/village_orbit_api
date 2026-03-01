import { itemsService } from './items.service';
import type { ItemPayload } from './items.types';

/**
 * This module contains higher‑level helpers for marketplace operations.
 * The application can import from `buySell.ts` when it needs a small
 * piece of business logic rather than consuming the raw service directly.
 */

/**
 * create an item and optionally upload images with the backend file API.
 * the component `PostItemForm` demonstrates how this function can be used
 * along with React Query / React Hook Form.
 */
export async function createItemWithImages(
  payload: ItemPayload,
  imageFiles: File[] = []
) {
    const { villageId } = payload;
  // 1. upload images using service helper (returns array of urls)
  const imageUrls = imageFiles.length
    ? await itemsService.uploadImages(imageFiles, villageId)
    : [];

  // 2. attach urls and call create endpoint
  // payload is already snake_case per ItemPayload
  const result = await itemsService.createItem({
    ...payload,
    imageUrls,
  } as any);

  if (!result.success) {
    throw new Error(result.error || 'create failed');
  }
  return result.data;
}


