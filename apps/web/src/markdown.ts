import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Card text is untrusted: sanitize after Markdown has generated HTML.
// Only explicit web/mail links, root-relative paths and fragments are allowed.
export function renderMarkdown(text: string): string {
  return DOMPurify.sanitize(marked.parse(text, { async: false }), {
    FORBID_TAGS: ['img', 'svg', 'math'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?:\/\/|mailto:)|\/(?!\/)|#)/i,
  });
}
