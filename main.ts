import { App, Plugin, Modal, TFile } from 'obsidian';


class TextInputModal extends Modal {
  private titleInput: HTMLInputElement;
  private textarea: HTMLTextAreaElement;
  private datalist: HTMLDataListElement;
  private submitButton: HTMLButtonElement;

  constructor(app :App, private onSubmit: (title: string, value: string) => void) {
    super(app);
  }

  noteExists(title: string){
    const existingNote = this.app.metadataCache.getFirstLinkpathDest(title, '')
    return existingNote ? true : false
  }



  onOpen() {
    // Create a container for better layout control
    const container = document.createElement('div');
    container.classList.add('quickly-plugin-container');
    this.contentEl.appendChild(container);

    // Add a title input field
    this.titleInput = document.createElement('input');
    this.titleInput.type = 'text';
    this.titleInput.placeholder = 'Enter note title';
    this.titleInput.classList.add('quickly-plugin-title-input');
    container.appendChild(this.titleInput);


    // Add a datalist for existing notes
    this.datalist = document.createElement('datalist');
    this.datalist.id = 'note-titles';
    container.appendChild(this.datalist);
    const noteTitles = this.app.vault.getMarkdownFiles().map((note) => note.basename);

    // Not used for now
    // const notePaths = this.app.vault.getMarkdownFiles().map((note) => note.path);

    // Function to update the datalist with matching note titles
    const updateDatalist = (searchText: string) => {
      // Clear the existing datalist
      this.datalist.innerHTML = '';

      // Filter the noteTitles array based on the user's input
      const filteredTitles = noteTitles.filter((title) => title.toLowerCase().includes(searchText.toLowerCase()));

      // Add the top 10 matching items to the datalist
      const maxItems = 10;
      for (let i = 0; i < Math.min(maxItems, filteredTitles.length); i++) {
        const option = document.createElement('option');
        option.value = filteredTitles[i];
        this.datalist.appendChild(option);
      }
    };


    // Set the list attribute for the title input field
    // By setting the list attribute of the input element to the id of the datalist element, you're associating the input field with the datalist. This association allows the browser to display the options in the datalist as suggestions when the user starts typing in the input field.
    this.titleInput.setAttribute('list', 'note-titles');



    // If Enter is pressed we want to navigate to existing note. 
    this.titleInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default action of submitting the form

        // if the list has items we choose the first one.
        if (this.datalist.childNodes.length > 0) {
          const firstOption = this.datalist.childNodes[0];
          this.onSubmit(firstOption.value, null)
          this.close()
        }

        // Implies no note with same name tf. create new note
        if (this.datalist.childNodes.length == 0 ){
          this.onSubmit(event.target.value, '')
          this.close()
        }

      }
    });

    // Navigate to the selected note from the datalist
    this.titleInput.addEventListener('change', (event) => {
      event.preventDefault();
      if (this.noteExists(event.target.value)){
        const selectedTitle = event.target.value;
        this.onSubmit(selectedTitle, null)
        this.close()
      }

    });


    // Add an input event listener on the titleInput to update the datalist based on the user's input
    this.titleInput.addEventListener('input', (event) => {
      const searchText = event.target.value;
      updateDatalist(searchText);
    });


    // Add a textarea for note content
    this.textarea = document.createElement('textarea');
    this.textarea.rows = 5;
    this.textarea.placeholder = 'Enter note content';
    this.textarea.classList.add('quickly-plugin-textarea-custom');
    this.textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        this.onSubmit(this.titleInput.value, this.textarea.value);
        this.close();
      } else if (event.key === 'Escape') {
        this.close();
      }
    });
    container.appendChild(this.textarea);

    // Add a submit button
    this.submitButton = document.createElement('button');
    this.submitButton.textContent = 'Submit';
    this.submitButton.classList.add('quickly-plugin-submit-button');
    this.submitButton.addEventListener('click', () => {
      this.onSubmit(this.titleInput.value, this.textarea.value);
      this.close();
    });
    container.appendChild(this.submitButton);
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

  // Open the Modal to provide title and content for the navigation or create new note
  openCaptureModal() {

    const modal = new TextInputModal(this.app, async (title, content) => {

      // We create a new note
      // content === '' for blank note
      if (title && (content || content === '')) {
        await this.createNoteWithTitle(title, content);
      }

      // We navigate
      if (title && content === null){
        this.navigateToSelectedNote(title)
      }

    });

    modal.open();
  }

  // 
  async createNoteWithTitle(title: string , content: string) {
    try {
      let note = this.app.vault.getAbstractFileByPath(`${title}.md`);
      if (!note) {

        // Create new note
        let noteRef = await this.app.vault.create(`${title}.md`, content);

        // Close the modal before navigating to the selected note
        let  newLeaf = this.app.workspace.getLeaf(false)
        await newLeaf.openFile(noteRef); 

        // Navigate to note after creation
        // this.navigateToSelectedNote(title)

      } else {
        console.error('Note with the same title already exists');
      }

    } catch (error) {
      console.error('Error while creating a new note:', error);
    }
  }

  async navigateToSelectedNote(title : string) {
    if (title) {
      
      const existingNote = this.app.metadataCache.getFirstLinkpathDest(title, '')
      if (existingNote instanceof TFile) {
        // Close the modal before navigating to the selected note
        const newLeaf = this.app.workspace.getLeaf(false)
        await newLeaf.openFile(existingNote); 
      }
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

  // async appendTextToNote(note : TFile , text : string) {
  //   if (note) {
  //     const currentContent = await this.app.vault.read(note);
  //     const newContent = currentContent + '\n' + text;
  //     await this.app.vault.modify(note, newContent);

  //     // Open the note and set the cursor position to the end of the note
  //     const leaf = this.app.workspace.activeLeaf;
  //     const editor = await leaf!.openFile(note, { state: { mode: 'source' } });
  //     editor.setCursor(editor.lineCount(), 0);
  //   } else {
  //     console.error('Target note not found');
  //   }
  // }

  
}
