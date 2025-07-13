import { WidgetInstance } from '../models/WidgetInstance';
import { deleteData, getData, postData, putData } from './apiClient';
import { toCreateDto, toUpdateDto } from './dtoMappers';

const BASE_ENDPOINT = '/Widgets';

/**
 * Service for managing widgets (CRUD) via the backend API.
 */
export const getWidgetsByPageId = async (
  id: string,
  encodedCredential?: string
): Promise<WidgetInstance[]> => {
  /**
   * Fetch all widgets for a given page ID.
   * @param id - The page ID
   * @param encodedCredential - Optional base64-encoded credentials for auth
   * @returns Promise<WidgetInstance[]>
   */
  const url = `${BASE_ENDPOINT}/page/${id}`;
  return await getData(url, {}, encodedCredential);
};

/**
 * Delete a widget by ID.
 * @param id - The widget ID
 * @param encodedCredential - Optional base64-encoded credentials for auth
 * @returns Promise<void>
 */
export const deleteWidget = async (
  id: string,
  encodedCredential?: string
): Promise<void> => {
  const url = `${BASE_ENDPOINT}/${id}`;
  console.info("Deleting widget at URL:", url);
  await deleteData(url, encodedCredential);
};

/**
 * Save (create or update) a widget instance.
 * @param widget - The widget instance to save
 * @returns Promise<void>
 */
export const saveWidget = async (widget: WidgetInstance): Promise<void> => {
  const dto = {
    parentId: null, // or widget.parentId if you have it
    widgetType: widget.widgetType,
    label: widget.label,
    config: widget.config,
    orderIndex: widget.orderIndex,
    isVisible: widget.isVisible,
    isPageTitle: widget.isPageTitle,
  };

  if (await widgetExists(widget.id)) {
    // Existing widget
    await putData(`${BASE_ENDPOINT}/${widget.id}`, dto);
  } else {
    // New widget
    const createDto = {
      ...dto,
      pageId: widget.pageId
    };
    await postData(`${BASE_ENDPOINT}`, createDto);
  }
};

/**
 * Check if a widget exists by ID.
 * @param id - The widget ID
 * @returns Promise<boolean>
 */
const widgetExists = async (id: string): Promise<boolean> => {
  try {
    await getData(`${BASE_ENDPOINT}/${id}`);
    return true;
  } catch {
    return false;
  }
};
