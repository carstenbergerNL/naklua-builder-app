import { WidgetInstance } from "../models/WidgetInstance";
import DividerWidget from "./widgets/DividerWidget/DividerWidget";
import HeadingWidget from "./widgets/HeadingWidget/HeadingWidget";
import ImageWidget from "./widgets/ImageWidget/ImageWidget";
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
    case "Image":
      return <ImageWidget config={config} />;
    case "Divider":
      return <DividerWidget config={config} />;
    default:
      return <div style={{ background: "#ffe0e0", padding: 8 }}>
        Unknown widget type: <strong>{widgetType}</strong>
      </div>;
  }
}
