export default function LinkWidget({ config }: { config: any }) {
  return <a href={config.href} target={config.target || "_self"}>{config.text}</a>;
}