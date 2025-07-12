export interface WidgetInstance {
  id: string;
  pageId: string;
  parentId?: string | null;
  widgetType: string;
  label?: string;
  config: Record<string, any>;
  isVisible: boolean;
  isPageTitle: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt?: string;
}
