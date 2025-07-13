/**
 * WidgetInstance represents a single widget placed on a page.
 * Includes config, order, and metadata fields.
 */
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

/**
 * @typedef {Object} WidgetInstance
 * @property {string} id - Unique widget ID
 * @property {string} pageId - Page this widget belongs to
 * @property {string|null} [parentId] - Parent widget/container ID
 * @property {string} widgetType - Widget type (e.g., 'Heading')
 * @property {string} [label] - Optional label for UI
 * @property {Object} config - Widget configuration object
 * @property {boolean} isVisible - Is the widget visible?
 * @property {boolean} isPageTitle - Is this widget the page title?
 * @property {number} orderIndex - Order index for sorting
 * @property {string} createdAt - Creation timestamp
 * @property {string} [updatedAt] - Last update timestamp
 */
