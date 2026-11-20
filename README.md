# ExplainCode

A web-based chat application that helps explain code snippets with markdown support. Built with vanilla JavaScript and CodeMirror editor.

## Features

- **Code Explanation**: Get explanations for code snippets in various programming languages
- **Markdown Support**: Write and format messages with markdown
- **Syntax Highlighting**: Code blocks with syntax highlighting for better readability
- **Conversation History**: Save and manage multiple conversations
- **Dark/Light Theme**: Toggle between light and dark themes
- **Export/Import**: Save conversations locally or share them with others
- **Responsive Design**: Works on both desktop and mobile devices

## Getting Started

1. Clone the repository or download the source files.
2. Serve the project folder with a local web server (for example, VS Code Live Server). ES modules are blocked by some browsers when opening `index.html` directly as a `file://` URL.
3. Open the served `index.html` in a modern web browser and start chatting.

## Project Structure

The browser entry point is `main.js`; feature code is split into focused ES modules:

- `src/app.js` — application startup and DOM event wiring
- `src/controllers/` — conversation, chat, and import/export workflows
- `src/services/` — browser storage and Groq API integration through the Cloudflare Worker
- `src/ui/` — conversation/message rendering, markdown, theme, and notifications
- `src/dom.js`, `src/state.js`, `src/utils.js` — shared DOM references, application state, and utilities

## Usage

1. Type or paste your code into the editor
2. Ask questions or request explanations about the code
3. The AI will provide detailed explanations and insights
4. Use markdown formatting for better readability
5. Save conversations for future reference

## Keyboard Shortcuts

- `Ctrl+Enter` / `Cmd+Enter`: Send message
- `Ctrl+/` / `Cmd+/`: Toggle comment on selected code
- `Tab`: Indent code (when text is selected)
- `Shift+Tab`: Unindent code

## Dependencies

- [CodeMirror](https://codemirror.net/): Code editor component
- [Groq API](https://console.groq.com/docs): Chat completions using `openai/gpt-oss-120b`

The browser sends chat requests to the configured Cloudflare Worker endpoint in `src/services/groq.js`. The Groq API key must remain configured as the worker's `EXPLAINCODE_KEY` secret; do not put it in browser code.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue in the repository.
