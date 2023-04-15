import { Plugin, Modal } from 'obsidian';


class TextInputModal extends Modal {
  private titleInput: HTMLInputElement;
  private textarea: HTMLTextAreaElement;

  constructor(app, private onSubmit: (title: string, value: string) => void) {
    super(app);
  }

  onOpen() {

    // Title Input
    this.titleInput = document.createElement('input');
    this.titleInput.type = 'text';
    this.titleInput.placeholder = 'Enter note title';
    this.contentEl.appendChild(this.titleInput);


    this.textarea = document.createElement('textarea');
    this.textarea.rows = 5;
    this.textarea.placeholder = 'Enter to capture';
    this.textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        this.onSubmit(this.titleInput.value, this.textarea.value);
        this.close();
      } else if (event.key === 'Escape') {
        this.close();
      }
    });
    this.contentEl.appendChild(this.textarea);
  }

  onClose() {
    this.titleInput.remove();
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

    // This is the global listeneer for obsidian url Eg. obsidian://quick-capture
    this.registerObsidianProtocolHandler('quick-capture', () => {
      this.openCaptureModal();
    });
  }

  //
  openCaptureModal() {
    const modal = new TextInputModal(this.app, async (title, content) => {
      if (title && content) {
        await this.createNoteWithTitle(title, content);
      }
    });
    modal.open();
  }

  // 
  async createNoteWithTitle(title, content) {
    try {
      const noteExists = this.app.vault.getAbstractFileByPath(`${title}.md`);
      if (!noteExists) {
        await this.app.vault.create(`${title}.md`, content);
      } else {
        console.error('Note with the same title already exists');
      }
    } catch (error) {
      console.error('Error while creating a new note:', error);
    }
  }

  // To append data to an existing note called Inbox
  // openCaptureModal() {
  //   const targetNoteTitle = 'Inbox'; // You can change this to any note title you prefer
  //   const targetNote = this.app.vault.getAbstractFileByPath(`${targetNoteTitle}.md`);

  //   const modal = new TextInputModal(this.app, async (capturedText) => {
  //     if (capturedText) {
  //       await this.appendTextToNote(targetNote, capturedText);
  //     }
  //   });
  //   modal.open();
  // }

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
