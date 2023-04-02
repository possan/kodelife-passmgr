import { LitElement, html, css } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";

@customElement("klutil-upload-dropzone")
class UploadDropzoneElement extends LitElement {
  static styles = css`
    div.main {
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid #555;
      border-radius: 10px;
      padding: 40px;
      box-sizing: border-box;
      gap: 20px;
      text-align: center;
    }

    div.main.over {
      border: 2px solid #fc0;
      background-color: #442;
    }

    input[type="file"] {
      visibility: hidden;
      height: 0;
    }

    klutil-button {
      width: 100%;
    }
  `;

  constructor() {
    super();
  }

  @query("div.main")
  private _div: HTMLElement;

  @query("input")
  private _fileelement: HTMLInputElement;

  private _clickHandler(e: Event) {
    console.log("click", this._fileelement);
    if (e.preventDefault) {
      e.preventDefault();
    }
    this._fileelement.click();
  }

  private _fileChanged(e: Event) {
    console.log("file changed", this._fileelement, e, e.target.files);
    const file = e.target.files[0];
    const event = new CustomEvent("upload", {
      bubbles: true,
      composed: true,
      detail: {
        file,
      },
    });
    this.dispatchEvent(event);
  }

  private _drop(e: Event) {
    console.log("drop", e);
    e.stopPropagation(); // Stops some browsers from redirecting.
    e.preventDefault();
    this._div.classList.remove("over");

    if (e.dataTransfer.items) {
      if (e.dataTransfer.items.length > 0) {
        const item = e.dataTransfer.items[0];
        if (item.kind === "file") {
          const file = item.getAsFile();
          console.log("dropped (item) file", file);

          const event = new CustomEvent("upload", {
            bubbles: true,
            composed: true,
            detail: {
              file,
            },
          });
          this.dispatchEvent(event);
        }
      }
    } else if (e.dataTransfer.files) {
      if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        console.log("dropped file", file);

        const event = new CustomEvent("upload", {
          bubbles: true,
          composed: true,
          detail: {
            file,
          },
        });
        this.dispatchEvent(event);
      }
    }
  }

  private _dragOver(e: Event) {
    console.log("drag over", e);
    e.preventDefault();

    if (e.dataTransfer.items || e.dataTransfer.files) {
      this._div.classList.add("over");
    }
  }

  private _dragLeave(e: Event) {
    console.log("drag out", e);
    e.preventDefault();
    this._div.classList.remove("over");
  }

  render() {
    return html`
      <div
        class="main"
        @drop=${this._drop}
        @dragover=${this._dragOver}
        @dragleave=${this._dragLeave}
      >
        <span>Drag your KodeLife .klproj file here to load it.</span>
        <klutil-button
          @click=${this._clickHandler}
          label="Select file"
        ></klutil-button>
      </div>
      <input type="file" @change=${this._fileChanged} />
    `;
  }
}
