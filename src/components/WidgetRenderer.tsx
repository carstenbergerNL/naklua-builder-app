import { WidgetInstance } from "../models/WidgetInstance";
import DividerWidget from "./widgets/DividerWidget/DividerWidget";
import HeadingWidget from "./widgets/HeadingWidget/HeadingWidget";
import ImageWidget from "./widgets/ImageWidget/ImageWidget";
import LinkWidget from "./widgets/LinkWidget/LinkWidget";
import ParagraphWidget from "./widgets/ParagraphWidget/ParagraphWidget";
import WordPressBlogListWidget from "./widgets/WordPressBlogListWidget/WordPressBlogListWidget";
import WordPressBlogPostWidget from "./widgets/WordPressBlogPostWidget/WordPressBlogPostWidget";
import WordPressPageWidget from "./widgets/WordPressPageWidget/WordPressPageWidget";

interface Props {
  widget: WidgetInstance;
  onConfigChange?: (key: string, value: any) => void;
  renderChildren?: () => React.ReactNode;
}

export default function WidgetRenderer({ widget, onConfigChange }: Props) {
  if (!widget.isVisible) return null;

  const { widgetType, config } = widget;

  switch (widgetType) {
    case "Heading":
      return <HeadingWidget config={config} onConfigChange={onConfigChange} />;
    case "Paragraph":
      return <ParagraphWidget config={config} onConfigChange={onConfigChange} />;
    case "Link":
      return <LinkWidget config={config} />;
    case "Image":
      return <ImageWidget config={config} onConfigChange={onConfigChange} />;
    case "Divider":
      return <DividerWidget config={config} />;
    case "WordPressBlogList":
      return <WordPressBlogListWidget config={config} />;
    case "WordPressBlogPost":
      return <WordPressBlogPostWidget config={config} />;
    case "WordPressPage":
      return <WordPressPageWidget config={config} />;

    default:
      return <div style={{ background: "#ffe0e0", padding: 8 }}>
        Unknown widget type: <strong>{widgetType}</strong>
      </div>;
  }
}
