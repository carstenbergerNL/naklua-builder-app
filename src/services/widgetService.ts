import { WidgetInstance } from '../models/WidgetInstance';
import { deleteData, getData, postData, putData } from './apiClient';
import { toCreateDto, toUpdateDto } from './dtoMappers';

const BASE_ENDPOINT = '/Widgets';

export const getWidgetsByPageId = async (
  id: string,
  encodedCredential?: string
): Promise<WidgetInstance[]> => {
  const url = `${BASE_ENDPOINT}/page/${id}`;
  return await getData(url, {}, encodedCredential);
};

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

export const deleteWidget = async (id: string): Promise<void> => {
  const url = `/widgets/${id}`;
  await deleteData(url);
};

const widgetExists = async (id: string): Promise<boolean> => {
  try {
    await getData(`${BASE_ENDPOINT}/${id}`);
    return true;
  } catch {
    return false;
  }
};
