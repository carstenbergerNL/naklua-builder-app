import { WidgetInstance } from "../models/WidgetInstance";

interface Props {
  widget: WidgetInstance;
}

export default function WidgetRenderer({ widget }: Props) {
  if (!widget.isVisible) return null;

  const { widgetType, config } = widget;

  switch (widgetType) {
    case "Heading":
      const HeadingTag = config.size || "h2";
      return <HeadingTag>{config.text || "Untitled"}</HeadingTag>;

    case "Paragraph":
      return <p>{config.text || "..."}</p>;

    default:
      return <div style={{ background: "#ffe0e0", padding: 8 }}>
        Unknown widget type: <strong>{widgetType}</strong>
      </div>;
  }
}
