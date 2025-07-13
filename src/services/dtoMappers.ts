import { WidgetInstance } from "../models/WidgetInstance";

/**
 * dtoMappers provides helper functions to map WidgetInstance objects to DTOs for API requests.
 */
export function toCreateDto(widget: WidgetInstance) {
  /**
   * Map a WidgetInstance to a DTO for creation.
   * @param widget - The widget instance
   * @returns DTO object for API
   */
  return {
    pageId: widget.pageId,
    parentId: null, // You can adapt this if using layout nesting
    widgetType: widget.widgetType,
    label: widget.label,
    config: widget.config,
    orderIndex: widget.orderIndex,
    isVisible: widget.isVisible,
    isPageTitle: widget.isPageTitle,
  };
}

/**
 * Map a WidgetInstance to a DTO for update.
 * @param widget - The widget instance
 * @returns DTO object for API
 */
export function toUpdateDto(widget: WidgetInstance) {
  return {
    parentId: null, // Same here
    widgetType: widget.widgetType,
    label: widget.label,
    config: widget.config,
    orderIndex: widget.orderIndex,
    isVisible: widget.isVisible,
    isPageTitle: widget.isPageTitle,
  };
}
