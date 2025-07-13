/**
 * WidgetDefinition describes the metadata and default config for a widget type.
 */
export interface WidgetDefinition {
  widgetType: string;      // "Heading", "Paragraph", "Table", etc.
  category: string;        // "Core", "Form", "Chart", "Custom"
  displayName: string;
  icon: string;
  defaultConfig: string;   // JSON string
  iconType?: string; // e.g. 'material' for Material Icons
}

/**
 * @typedef {Object} WidgetDefinition
 * @property {string} widgetType - Widget type (e.g., 'Heading', 'Paragraph')
 * @property {string} category - Widget category (e.g., 'Core', 'Form')
 * @property {string} displayName - Display name for UI
 * @property {string} icon - Icon name or class
 * @property {string} defaultConfig - JSON string of default config
 * @property {string} [iconType] - Optional icon type (e.g., 'material')
 */

