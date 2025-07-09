import { WidgetInstance } from "../models/WidgetInstance";

export function toCreateDto(widget: WidgetInstance) {
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
