export interface WidgetDefinition {
  widgetType: string;      // "Heading", "Paragraph", "Table", etc.
  category: string;        // "Core", "Form", "Chart", "Custom"
  displayName: string;
  defaultConfig: string;   // JSON string
}

