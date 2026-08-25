import { useToast } from "../hooks/useToast";

export default function Toast() {
  const { message, visible } = useToast();

  return (
    <div className={`toast${visible ? " show" : ""}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M5 12l5 5L20 7" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
