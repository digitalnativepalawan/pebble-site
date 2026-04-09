import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";

interface EditableFieldProps {
  section: string;
  field: string;
  fallback: string;
  multiline?: boolean;
}

const EditableField = ({ section, field, fallback, multiline = false }: EditableFieldProps) => {
  const { isAdminMode, getContent, updateContent } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");

  const text = getContent(section, field, fallback);

  if (!isAdminMode) return <>{text}</>;

  if (editing) {
    const sharedClass =
      "bg-primary/5 border border-dashed border-primary/40 rounded px-2 py-1 outline-none w-full";

    const handleBlur = async () => {
      if (val.trim() !== text.trim()) {
        await updateContent(section, field, val);
      }
      setEditing(false);
    };

    if (multiline) {
      return (
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleBlur}
          className={`${sharedClass} min-h-[80px] resize-y`}
          style={{ font: "inherit", color: "inherit", letterSpacing: "inherit" }}
          autoFocus
        />
      );
    }

    return (
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        className={sharedClass}
        style={{ font: "inherit", color: "inherit", letterSpacing: "inherit" }}
        autoFocus
      />
    );
  }

  return (
    <span
      className="cursor-pointer border-b border-dashed border-transparent hover:border-primary/30 transition-colors"
      onClick={() => {
        setVal(text);
        setEditing(true);
      }}
    >
      {text}
    </span>
  );
};

export default EditableField;
