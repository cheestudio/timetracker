const ToggleElement = ({ children, isVisible }: { children: React.ReactNode, isVisible: boolean }) => {
  return isVisible ? <div>{children}</div> : null;
}

export default ToggleElement;