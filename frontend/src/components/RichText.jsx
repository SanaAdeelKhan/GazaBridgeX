// frontend/src/components/RichText.jsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import colors from '../theme/colors';

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;

// Plain mode: preserves line breaks and auto-links URLs, but does NOT parse
// Markdown syntax (**bold**, - lists). Used for user-generated content
// (Chat, Posts) — a user typing "*" in a normal sentence shouldn't trigger formatting.
function PlainLinkedText({ text }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line.split(URL_SPLIT_REGEX).map((part, j) =>
            /^https?:\/\//.test(part) ? (
              <a
                key={j}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.gold }}
                className="underline hover:brightness-90"
              >
                {part}
              </a>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

// Full Markdown mode: bold, lists, and links via react-markdown.
// Used for admin-authored content (Resources, Notifications, Courses, Live Sections).
// react-markdown does not render raw HTML by default, so this stays safe from
// script injection without any extra sanitization step.
function MarkdownText({ text }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: (props) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.gold }}
            className="underline hover:brightness-90"
          />
        ),
        strong: (props) => <strong {...props} style={{ color: colors.body }} />,
        ul: (props) => <ul {...props} className="list-disc pl-5 space-y-1" />,
        ol: (props) => <ol {...props} className="list-decimal pl-5 space-y-1" />,
        p: (props) => <p {...props} className="mb-2 last:mb-0" />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

/**
 * Shared text renderer for every description/body field in the app.
 *
 * fullMarkdown=true  → admin content: bold, lists, headings, auto-linked URLs
 * fullMarkdown=false → user content: plain text, line breaks preserved, URLs auto-linked
 */
export default function RichText({ text, fullMarkdown = false }) {
  if (!text) return null;
  return fullMarkdown ? <MarkdownText text={text} /> : <PlainLinkedText text={text} />;
}
