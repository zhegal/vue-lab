import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({
    html: false,
    linkify: false,
    typographer: false,
    maxNesting: 20,
});
const validateLink = markdown.validateLink.bind(markdown);

markdown.validateLink = (url) => validateLink(url) && /^(https?:\/\/|mailto:)/i.test(url);
markdown.renderer.rules.link_open = (tokens, index, options, _, renderer) => {
    const token = tokens[index];
    if (!token) return '';
    token.attrSet('target', '_blank');
    token.attrSet('rel', 'noopener noreferrer');
    return renderer.renderToken(tokens, index, options);
};
markdown.renderer.rules.image = (tokens, index) => {
    // Rendering alt text avoids network requests from an untrusted document.
    const description = tokens[index]?.content || 'No description';
    const text = markdown.utils.escapeHtml(`[Image: ${description}]`);
    return `<span class="image-description">${text}</span>`;
};

export function renderMarkdown(source: string): string {
    return markdown.render(source);
}
