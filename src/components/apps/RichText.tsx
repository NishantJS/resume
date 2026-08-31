import { FC, Fragment, ReactNode } from "react";
import { Link } from "react-router-dom";

/* A policy is prose with a handful of inline shapes in it — an emphasised
   clause, a permission name, a desk address, a link out to a third party's
   policy. Storing it as JSX would drag a legal document into a component
   file; storing it as plain strings would lose all four. So the data file
   keeps the text and this renders the markup:

     **bold**   *italic*   `code`   [text](href)   name@nishant.click

   Bold and italic recurse, so **a `code` span** works. Bare addresses are
   matched on this site's domain only, so an example address in prose is
   left as text.                                                          */
const TOKEN =
  String.raw`\*\*([\s\S]+?)\*\*|\*([\s\S]+?)\*|` +
  "`([^`]+?)`" +
  String.raw`|\[([^\]]+?)\]\(([^)]+?)\)|([A-Za-z0-9._%+-]+@nishant\.click)`;

const render = (text: string, ink: string, prefix: string): ReactNode[] => {
  /* A fresh regex per call — one shared `g` instance would have its
     lastIndex clobbered by the recursive calls below. */
  const re = new RegExp(TOKEN, "g");
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, bold, italic, code, label, href, email] = m;
    const key = `${prefix}${n++}`;

    if (bold !== undefined) {
      out.push(<strong key={key} className="font-medium" style={{ color: ink }}>{render(bold, ink, `${key}-`)}</strong>);
    } else if (italic !== undefined) {
      out.push(<em key={key}>{render(italic, ink, `${key}-`)}</em>);
    } else if (code !== undefined) {
      out.push(<code key={key} className="rt-code">{code}</code>);
    } else if (label !== undefined) {
      out.push(
        href.startsWith("/")
          ? <Link key={key} to={href} className="link">{label}</Link>
          : <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="link">{label}</a>,
      );
    } else {
      out.push(<a key={key} href={`mailto:${email}`} className="link">{email}</a>);
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
};

/** Inline markup for policy and support copy. `ink` is the page's full
    ink, so an emphasised run sits a shade above the body colour. */
const RichText: FC<{ text: string; ink: string }> = ({ text, ink }) => (
  <Fragment>{render(text, ink, "")}</Fragment>
);

export default RichText;
