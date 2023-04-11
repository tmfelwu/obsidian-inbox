import { Plugin, Modal } from 'obsidian';


class TextInputModal extends Modal {
    private textarea: HTMLTextAreaElement;
  
    constructor(app, private onSubmit: (value: string) => void) {
      super(app);
    }
  
    onOpen() {
      this.textarea = document.createElement('textarea');
      this.textarea.rows = 5;
      this.textarea.placeholder = 'Enter to capture';
      this.textarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.ctrlKey) {
          this.onSubmit(this.textarea.value);
          this.close();
        } else if (event.key === 'Escape') {
          this.close();
        }
      });
      this.contentEl.appendChild(this.textarea);
    }
  
    onClose() {
      this.textarea.remove();
    }
  }
  
export default class QuickCaptureToNotePlugin extends Plugin {

    async onload() {
        this.addCommand({
          id: 'quick-capture-to-note',
          name: 'Quick Capture to Note',
          callback: () => this.openCaptureModal(),
        });
    
        this.registerObsidianProtocolHandler('quick-capture', () => {
          this.openCaptureModal();
        });
      }

      openCaptureModal() {
        const targetNoteTitle = 'Inbox'; // You can change this to any note title you prefer
        const targetNote = this.app.vault.getAbstractFileByPath(`${targetNoteTitle}.md`);
    
        const modal = new TextInputModal(this.app, async (capturedText) => {
          if (capturedText) {
            await this.appendTextToNote(targetNote, capturedText);
          }
        });
        modal.open();
      }

  async appendTextToNote(note, text) {
    if (note) {
      const currentContent = await this.app.vault.read(note);
      const newContent = currentContent + '\n' + text;
      await this.app.vault.modify(note, newContent);
  
      // Open the note and set the cursor position to the end of the note
      const leaf = this.app.workspace.activeLeaf;
      const editor = await leaf.openFile(note, { state: { mode: 'source' } });
      editor.setCursor(editor.lineCount(), 0);
    } else {
      console.error('Target note not found');
    }
  }
}
