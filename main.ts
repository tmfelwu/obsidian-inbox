import { Plugin, Modal } from 'obsidian';


class TextInputModal extends Modal {
  private titleInput: HTMLInputElement;
  private textarea: HTMLTextAreaElement;

  constructor(app, private onSubmit: (title: string, value: string) => void) {
    super(app);
  }

  onOpen() {
    // Create a container for better layout control
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '1rem';
    container.style.padding = '1rem';
    this.contentEl.appendChild(container);

    // Add a title input field
    this.titleInput = document.createElement('input');
    this.titleInput.type = 'text';
    this.titleInput.placeholder = 'Enter note title';
    this.titleInput.style.fontSize = '1.1em';
    this.titleInput.style.padding = '0.5rem';
    this.titleInput.style.border = '1px solid var(--text-faint)';
    this.titleInput.style.borderRadius = '4px';
    container.appendChild(this.titleInput);


    // Add a dropdown for existing notes
    this.dropdown = document.createElement('select');
    this.dropdown.style.display = 'none';
    this.dropdown.style.marginTop = '0.5rem';
    this.dropdown.style.fontSize = '1em';
    this.dropdown.style.padding = '0.5rem';
    this.dropdown.style.border = '1px solid var(--text-faint)';
    this.dropdown.style.borderRadius = '4px';
    container.appendChild(this.dropdown);

    // Populate the dropdown and open the note on selection
    this.titleInput.addEventListener('input', (event) => {
      const matchingNotes = this.app.vault.getMarkdownFiles().filter((note) => note.basename.toLowerCase().startsWith(event.target.value.toLowerCase()));
      this.dropdown.innerHTML = '';
      if (matchingNotes.length > 0) {
        this.dropdown.style.display = 'block';
        for (const note of matchingNotes) {
          const option = document.createElement('option');
          option.value = note.path;
          option.textContent = note.basename;
          this.dropdown.appendChild(option);
        }
      } else {
        this.dropdown.style.display = 'none';
      }
    });

    this.dropdown.addEventListener('change', (event) => {
      const selectedNote = this.app.vault.getAbstractFileByPath(event.target.value);
      if (selectedNote) {
        this.close();
        this.app.workspace.activeLeaf.openFile(selectedNote);
      }
    });

    // Add a textarea for note content
    this.textarea = document.createElement('textarea');
    this.textarea.rows = 5;
    this.textarea.placeholder = 'Enter note content';
    this.textarea.style.fontSize = '1em';
    this.textarea.style.padding = '0.5rem';
    this.textarea.style.border = '1px solid var(--text-faint)';
    this.textarea.style.borderRadius = '4px';
    this.textarea.style.resize = 'vertical';
    this.textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        this.onSubmit(this.titleInput.value, this.textarea.value);
        this.close();
      } else if (event.key === 'Escape') {
        this.close();
      }
    });
    container.appendChild(this.textarea);
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
