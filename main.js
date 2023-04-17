"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class TextInputModal extends obsidian_1.Modal {
    constructor(app, onSubmit) {
        super(app);
        this.onSubmit = onSubmit;
    }
    noteExists(title) {
        const existingNote = this.app.metadataCache.getFirstLinkpathDest(title, '');
        return existingNote ? true : false;
    }
    onOpen() {
        // Create a container for better layout control
        const container = document.createElement('div');
        container.classList.add('container');
        this.contentEl.appendChild(container);
        // Add a title input field
        this.titleInput = document.createElement('input');
        this.titleInput.type = 'text';
        this.titleInput.placeholder = 'Enter note title';
        this.titleInput.classList.add('title-input');
        container.appendChild(this.titleInput);
        // Add a datalist for existing notes
        this.datalist = document.createElement('datalist');
        this.datalist.id = 'note-titles';
        container.appendChild(this.datalist);
        const noteTitles = this.app.vault.getMarkdownFiles().map((note) => note.basename);
        const notePaths = this.app.vault.getMarkdownFiles().map((note) => note.path);
        // Function to update the datalist with matching note titles
        const updateDatalist = (searchText) => {
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
                    this.onSubmit(firstOption.value, null);
                    this.close();
                }
                // Implies no note with same name tf. create new note
                if (this.datalist.childNodes.length == 0) {
                    this.onSubmit(event.target.value, '');
                    this.close();
                }
            }
        });
        // Navigate to the selected note from the datalist
        this.titleInput.addEventListener('change', (event) => {
            event.preventDefault();
            if (this.noteExists(event.target.value)) {
                const selectedTitle = event.target.value;
                this.onSubmit(selectedTitle, null);
                this.close();
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
        this.textarea.classList.add('textarea-custom');
        this.textarea.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && event.ctrlKey) {
                this.onSubmit(this.titleInput.value, this.textarea.value);
                this.close();
            }
            else if (event.key === 'Escape') {
                this.close();
            }
        });
        container.appendChild(this.textarea);
        // Add a submit button
        this.submitButton = document.createElement('button');
        this.submitButton.textContent = 'Submit';
        this.submitButton.style.fontSize = '1em';
        this.submitButton.style.padding = '0.5rem';
        this.submitButton.style.marginTop = '1rem';
        this.submitButton.style.border = '1px solid var(--text-faint)';
        this.submitButton.style.borderRadius = '4px';
        this.submitButton.style.cursor = 'pointer';
        this.submitButton.style.backgroundColor = 'var(--background-secondary)';
        this.submitButton.addEventListener('click', () => {
            this.onSubmit(this.titleInput.value, this.textarea.value);
            this.close();
        });
        container.appendChild(this.submitButton);
    }
}
class QuickCaptureToNotePlugin extends obsidian_1.Plugin {
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
            if (title && content === null) {
                this.navigateToSelectedNote(title);
            }
        });
        modal.open();
    }
    // 
    async createNoteWithTitle(title, content) {
        try {
            let note = this.app.vault.getAbstractFileByPath(`${title}.md`);
            if (!note) {
                // Create new note
                await this.app.vault.create(`${title}.md`, content);
                // Navigate to note after creation
                this.navigateToSelectedNote(title);
            }
            else {
                console.error('Note with the same title already exists');
            }
        }
        catch (error) {
            console.error('Error while creating a new note:', error);
        }
    }
    async navigateToSelectedNote(title) {
        if (title) {
            const existingNote = this.app.metadataCache.getFirstLinkpathDest(title, '');
            if (existingNote instanceof obsidian_1.TFile) {
                // Close the modal before navigating to the selected note
                const newLeaf = this.app.workspace.getLeaf(false);
                await newLeaf.openFile(existingNote);
            }
        }
    }
}
exports.default = QuickCaptureToNotePlugin;
//Function to upload file to s3 bucket
//function
