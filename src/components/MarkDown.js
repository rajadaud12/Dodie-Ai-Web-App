import React from 'react';

export const convertMarkdownToReact = (text) => {
  if (!text) return null;

  // Regular expressions to match markdown elements
  const regex = /(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|\n- .*|\n\d+\. .+)/g;

  // Split the text into parts, preserving markdown syntax
  const parts = text.split(regex);

  return parts.map((part, index) => {
    // Bold with ** or __
    if (/^\*\*.*\*\*$/.test(part) || /^__.*__$/.test(part)) {
      return <strong key={index}>{part.replace(/\*\*|__/g, '')}</strong>;
    }

    // Italic with * or _
    if (/^\*.*\*$/.test(part) || /^_.*_$/.test(part)) {
      return <em key={index}>{part.replace(/\*|_/g, '')}</em>;
    }

    // Inline code with `
    if (/^`.*`$/.test(part)) {
      return <code key={index}>{part.replace(/`/g, '')}</code>;
    }

    // Unordered lists starting with `-`
    if (part.startsWith('- ')) {
      return <ul key={index}><li>{part.replace(/^- /, '')}</li></ul>;
    }

    // Ordered lists starting with numbers
    if (/^\d+\.\s/.test(part)) {
      return <ol key={index}><li>{part.replace(/^\d+\.\s/, '')}</li></ol>;
    }

    // Regular text
    return part;
  });
};

// Example of how to use in a component
export const MarkdownText = ({ children }) => {
  return <>{convertMarkdownToReact(children)}</>;
};
