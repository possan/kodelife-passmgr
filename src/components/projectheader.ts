import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { KLProject } from "../model/unpacked";
import { DownloadProjectEventDetails } from "../types/editor";

@customElement("klutil-project-header")
export class ProjectHeaderElement extends LitElement {
  static styles = css`
    div.header {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 220px;
      text-align: center;
    }

    ul {
      padding: 0;
      margin: 0;
      list-style: none;
      position: relative;
      min-height: 20px;
    }

    ul li {
      border: 1px solid #222;
      padding: 10px;
      margin: 0;
      cursor: move;
    }

    li.dragover {
      border: 1px dashed #f0f;
    }

    .actions {
      width: 100%;
    }

    li.empty {
      color: #555;
    }

    li.dragging {
      opacity: 0.4;
    }

    li.highlight {
      background-color: rgba(255, 0, 255, 0.5);
      height: 8px;
      position: absolute;
      left: 0;
      padding: 0;
      top: 10px;
      right: 0;
      pointer-events: none;
    }
  `;

  constructor() {
    super();
    this._project = undefined;
  }

  @state()
  private _project: KLProject | undefined = undefined;

  setProject(project: KLProject | undefined) {
    console.log("set project", project);
    this._project = project;
    this.requestUpdate();
  }

  private _upload(e: Event) {
    const event = new CustomEvent("upload", {
      bubbles: true,
      composed: true,
      detail: e.detail,
    });
    this.dispatchEvent(event);
  }

  private _clickSerialize(e: Event) {
    const event = new CustomEvent("download", {
      bubbles: true,
      composed: true,
      detail: {
        xml: false,
      } as DownloadProjectEventDetails,
    });
    this.dispatchEvent(event);
  }

  private _clickSerialize2(e: Event) {
    const event = new CustomEvent("download", {
      bubbles: true,
      composed: true,
      detail: {
        xml: true,
      } as DownloadProjectEventDetails,
    });
    this.dispatchEvent(event);
  }

  private _clear(e: Event) {
    const event = new CustomEvent("clear", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (this._project) {
      return html`
        <div class="header">
          <p>
            <!-- <b>Project loaded:</b><br /> -->
            ${this._project?.filename}
          </p>

          <div class="actions">
            <klutil-button
              @click=${this._clickSerialize}
              label="Download .klproj"
            ></klutil-button>

            <klutil-button
              secondary
              @click=${this._clickSerialize2}
              label="Download .xml"
            ></klutil-button>

            <klutil-button
              secondary
              @click=${this._clear}
              label="Unload"
            ></klutil-button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="header">
        <klutil-upload-dropzone
          @upload=${this._upload}
        ></klutil-upload-dropzone>
      </div>
    `;
  }
}
