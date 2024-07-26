export function ToggleElement({ children, isVisible }: { children: React.ReactNode, isVisible: boolean }) {
  return isVisible ? <div>{children}</div> : null;
}