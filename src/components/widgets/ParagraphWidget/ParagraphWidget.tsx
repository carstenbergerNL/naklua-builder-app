import { useState, useRef, useEffect, useCallback } from "react";
import { createEditor, Descendant, BaseEditor } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

interface Props {
  config: any;
  onConfigChange?: (key: string, value: any) => void;
  editing?: boolean;
  setEditing?: () => void;
  clearEditing?: () => void;
}

function initialValueFromText(text: string): Descendant[] {
  return [
    {
      type: "paragraph",
      children: [{ text: text || "..." }],
    } as Descendant,
  ];
}

function textFromValue(value: Descendant[]): string {
  // Find the first element with children and join its children's text
  const para = value.find((n) => typeof n === "object" && "children" in n && Array.isArray((n as any).children));
  return para ? (para as any).children.map((c: any) => c.text).join("") : "";
}

export default function ParagraphWidget({ config, onConfigChange, editing, setEditing, clearEditing }: Props) {
  const [editorState, setEditorState] = useState(() => {
    const blocksFromHtml = htmlToDraft(config.text || '');
    const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
    return EditorState.createWithContent(contentState);
  });
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blocksFromHtml = htmlToDraft(config.text || '');
    const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
    setEditorState(EditorState.createWithContent(contentState));
  }, [config.text]);

  const handleDoubleClick = () => {
    if (onConfigChange && setEditing) {
      setEditing();
      console.log('Double click: editing mode enabled');
    }
  };

  const handleBlur = () => {
    if (clearEditing) clearEditing();
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    if (onConfigChange && html !== config.text) {
      onConfigChange('text', html);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (clearEditing) clearEditing();
      const blocksFromHtml = htmlToDraft(config.text || '');
      const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
      setEditorState(EditorState.createWithContent(contentState));
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editorRef.current) {
        (editorRef.current as HTMLElement).blur();
      }
    }
  };

  if (editing) {
    return (
      <div ref={editorRef} tabIndex={-1} onBlur={handleBlur} style={{ outline: 'none' }}>
        <Editor
          editorState={editorState}
          onEditorStateChange={setEditorState}
          toolbarClassName="rdw-toolbar"
          wrapperClassName="rdw-wrapper"
          editorClassName="rdw-editor"
          editorStyle={{ background: '#fffbe6', color: '#222', minHeight: 32, border: '1px solid #2563eb', borderRadius: 4, padding: 4 }}
          onKeyDown={handleKeyDown}
          toolbar={{ options: ['inline', 'list', 'link', 'history'], inline: { options: ['bold', 'italic', 'underline'] } }}
        />
      </div>
    );
  }

  return (
    <div onDoubleClick={handleDoubleClick} style={{ cursor: onConfigChange ? 'pointer' : undefined }}>
      <div dangerouslySetInnerHTML={{ __html: config.text || '...' }} />
    </div>
  );
}