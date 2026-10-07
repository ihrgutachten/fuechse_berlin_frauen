"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { cn } from "@/lib/format";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-sm font-semibold transition",
        active
          ? "bg-[var(--fb-accent)] text-white"
          : "text-[var(--fb-ink)] hover:bg-[var(--fb-soft)]",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link-Adresse (leer lassen zum Entfernen):", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--fb-border)] bg-white px-2 py-1.5">
      <ToolbarButton
        title="Fett"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </ToolbarButton>
      <ToolbarButton
        title="Kursiv"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-[var(--fb-border)]" />
      <ToolbarButton
        title="Zwischenüberschrift"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="Kleine Überschrift"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-[var(--fb-border)]" />
      <ToolbarButton
        title="Aufzählung"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • Liste
      </ToolbarButton>
      <ToolbarButton
        title="Nummerierte Liste"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. Liste
      </ToolbarButton>
      <ToolbarButton
        title="Zitat"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo; &rdquo;
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-[var(--fb-border)]" />
      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
        Link
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[260px] px-4 py-3 text-base leading-relaxed text-[var(--fb-ink)] outline-none",
          "[&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-tight",
          "[&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-bold",
          "[&_p]:my-3",
          "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--fb-accent)] [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_a]:text-[var(--fb-accent)] [&_a]:underline",
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) {
    return (
      <div className="rounded-[var(--fb-radius)] border border-[var(--fb-border)] bg-white p-4 text-sm text-[var(--fb-text-muted)]">
        Editor lädt …
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--fb-radius)] border border-[var(--fb-border)]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
