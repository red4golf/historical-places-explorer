export function parseMarkdown(content) {
  // Check if content has frontmatter (starts with ---)
  if (!content.startsWith('---')) {
    return {
      metadata: {},
      content: content
    };
  }

  // Find the closing frontmatter delimiter
  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return {
      metadata: {},
      content: content
    };
  }

  // Extract and parse frontmatter
  const frontmatter = content.substring(3, endIndex).trim();
  const metadata = {};
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      let value = valueParts.join(':').trim();
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      // Handle arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map(v => v.trim().replace(/"/g, ''));
      }
      metadata[key.trim()] = value;
    }
  });

  // Get the actual content after frontmatter
  const mainContent = content.substring(endIndex + 3).trim();

  return {
    metadata,
    content: mainContent
  };
}