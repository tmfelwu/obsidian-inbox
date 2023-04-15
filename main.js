"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var obsidian_1 = require("obsidian");
var TextInputModal = /** @class */ (function (_super) {
    __extends(TextInputModal, _super);
    function TextInputModal(app, onSubmit) {
        var _this = _super.call(this, app) || this;
        _this.onSubmit = onSubmit;
        return _this;
    }
    TextInputModal.prototype.onOpen = function () {
        var _this = this;
        // Create a container for better layout control
        var container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '1rem';
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
        // Add a textarea for note content
        this.textarea = document.createElement('textarea');
        this.textarea.rows = 5;
        this.textarea.placeholder = 'Enter note content';
        this.textarea.style.fontSize = '1em';
        this.textarea.style.padding = '0.5rem';
        this.textarea.style.border = '1px solid var(--text-faint)';
        this.textarea.style.borderRadius = '4px';
        this.textarea.style.resize = 'vertical';
        this.textarea.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && event.ctrlKey) {
                _this.onSubmit(_this.titleInput.value, _this.textarea.value);
                _this.close();
            }
            else if (event.key === 'Escape') {
                _this.close();
            }
        });
        container.appendChild(this.textarea);
    };
    TextInputModal.prototype.onClose = function () {
        this.titleInput.remove();
        this.textarea.remove();
    };
    return TextInputModal;
}(obsidian_1.Modal));
var QuickCaptureToNotePlugin = /** @class */ (function (_super) {
    __extends(QuickCaptureToNotePlugin, _super);
    function QuickCaptureToNotePlugin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QuickCaptureToNotePlugin.prototype.onload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.addCommand({
                    id: 'quick-capture-to-note',
                    name: 'Quick Capture to Note',
                    callback: function () { return _this.openCaptureModal(); },
                });
                // This is the global listeneer for obsidian url Eg. obsidian://quick-capture
                this.registerObsidianProtocolHandler('quick-capture', function () {
                    _this.openCaptureModal();
                });
                return [2 /*return*/];
            });
        });
    };
    //
    QuickCaptureToNotePlugin.prototype.openCaptureModal = function () {
        var _this = this;
        var modal = new TextInputModal(this.app, function (title, content) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(title && content)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createNoteWithTitle(title, content)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
        modal.open();
    };
    // 
    QuickCaptureToNotePlugin.prototype.createNoteWithTitle = function (title, content) {
        return __awaiter(this, void 0, void 0, function () {
            var noteExists, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        noteExists = this.app.vault.getAbstractFileByPath("".concat(title, ".md"));
                        if (!!noteExists) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.app.vault.create("".concat(title, ".md"), content)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        console.error('Note with the same title already exists');
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Error while creating a new note:', error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
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
    QuickCaptureToNotePlugin.prototype.appendTextToNote = function (note, text) {
        return __awaiter(this, void 0, void 0, function () {
            var currentContent, newContent, leaf, editor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!note) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.app.vault.read(note)];
                    case 1:
                        currentContent = _a.sent();
                        newContent = currentContent + '\n' + text;
                        return [4 /*yield*/, this.app.vault.modify(note, newContent)];
                    case 2:
                        _a.sent();
                        leaf = this.app.workspace.activeLeaf;
                        return [4 /*yield*/, leaf.openFile(note, { state: { mode: 'source' } })];
                    case 3:
                        editor = _a.sent();
                        editor.setCursor(editor.lineCount(), 0);
                        return [3 /*break*/, 5];
                    case 4:
                        console.error('Target note not found');
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return QuickCaptureToNotePlugin;
}(obsidian_1.Plugin));
exports.default = QuickCaptureToNotePlugin;
