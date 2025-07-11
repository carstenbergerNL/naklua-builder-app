export interface WidgetDefinition {
  widgetType: string;      // "Heading", "Paragraph", "Table", etc.
  category: string;        // "Core", "Form", "Chart", "Custom"
  displayName: string;
  icon: string;
  defaultConfig: string;   // JSON string
  iconType?: string; // e.g. 'material' for Material Icons
}

