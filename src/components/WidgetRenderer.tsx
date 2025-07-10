import { WidgetInstance } from "../models/WidgetInstance";
import HeadingWidget from "./widgets/HeadingWidget/HeadingWidget";
import LinkWidget from "./widgets/LinkWidget/LinkWidget";
import ParagraphWidget from "./widgets/ParagraphWidget/ParagraphWidget";

interface Props {
  widget: WidgetInstance;
}

export default function WidgetRenderer({ widget }: Props) {
  if (!widget.isVisible) return null;

  const { widgetType, config } = widget;

  switch (widgetType) {
    case "Heading":
      return <HeadingWidget config={config} />;
    case "Paragraph":
      return <ParagraphWidget config={config} />;
    case "Link":
      return <LinkWidget config={config} />;

    default:
      return <div style={{ background: "#ffe0e0", padding: 8 }}>
        Unknown widget type: <strong>{widgetType}</strong>
      </div>;
  }
}
