import { LitElement, html, css } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { PassInfo } from "../types/editor";

@customElement("klutil-pass-list")
export class PassListElement extends LitElement {
  static styles = css`
    ul {
      border: 1px solid #555;
      border-radius: 6px;
      padding: 2px;
      margin: 0;
      list-style: none;
      position: relative;
      min-height: 20px;
    }

    ul li {
      border: 1px solid #222;
      border-radius: 2px;
      padding: 10px;
      margin: 0;
      cursor: move;
      display: flex;
    }

    ul li:hover {
      background-color: #442;
      border: 1px solid #555;
    }

    li.dragover {
      border: 1px dashed #f0f;
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

    li small {
      color: #555;
    }

    li button.remove {
      background: none;
      display: block;
      border: 0;
      color: #666;
      cursor: pointer;
      border-radius: 4px;
    }

    li button.remove:hover {
      background-color: #fc0;
      color: #000;
    }

    li span.label {
      flex: 1;
      text-align: start;
      color: #fc0;
    }

    .help {
      display: block;
      margin: 10px 0;
      color: #666;
    }
  `;

  constructor() {
    super();
    this._highlightLocation = -1;
    this._list = [];
    this.emptytext = undefined;
  }

  @state()
  private _highlightLocation: number;

  @state()
  private _showhighlight: boolean;

  @state()
  private _dropenabled: boolean = false;

  @state()
  private _list: PassInfo[] = [];

  @state()
  private _dragsourceid: string = "";

  @state()
  private _showremove: boolean = false;

  @property({ type: String })
  emptytext: string | undefined = undefined;

  @query("ul")
  _listelement: HTMLElement;

  @query("li.highlight")
  _highlightelement: HTMLElement;

  setList(list: PassInfo[]) {
    console.log("set list", list);
    this._list = list;
    this.requestUpdate();
  }

  _updateHighlightLocation() {
    if (this._highlightLocation !== -1 && this._showhighlight) {
      var x0 = 0;
      var x1 = 0;
      var y = 0;

      const rootrect = this._listelement.getBoundingClientRect();

      const items = this._listelement.querySelectorAll("li.item");
      items.forEach((item, index) => {
        const r = item.getBoundingClientRect();

        x0 = r.x;
        x1 = r.x + r.width;

        if (this._highlightLocation === index) {
          y = r.y - 5 - rootrect.y;
        }

        if (this._highlightLocation === index + 1) {
          y = r.y + r.height - 5 - rootrect.y;
        }
      });

      this._highlightelement.style.display = "block";
      this._highlightelement.style.top = `${y}px`;
    } else {
      this._highlightelement.style.display = "none";
    }
  }

  _findHighlightLocation(x: number, y: number) {
    let highlight = -1;

    const items = this._listelement.querySelectorAll("li.item");
    items.forEach((item, index) => {
      const r = item.getBoundingClientRect();

      const y0 = r.y;
      const y1 = r.y + r.height - 1;
      const ym1 = Math.round((y0 + y1) / 2);

      const x0 = r.x;
      const x1 = r.x + r.width - 1;

      if (x >= x0 && x <= x1 && y >= y0 && y < ym1) {
        highlight = index;
      } else if (x >= x0 && x <= x1 && y >= ym1 && y <= y1) {
        highlight = index + 1;
      }
    });

    this._highlightLocation = highlight;

    this._updateHighlightLocation();
  }

  _dragStart(e: Event) {
    console.log(
      "drag start",
      e.target,
      e.shiftKey,
      e.ctrlKey,
      e.altKey,
      e.metaKey
    );

    this._dragsourceid = e.target.id;

    e.target.classList.add("dragging");

    const sourceList = this.getAttribute("id");
    const sourceId = e.target.id;
    const sourceIndex = this._list.findIndex((l) => l.id === sourceId);

    e.dataTransfer.clearData();
    e.dataTransfer.setData(
      "text/plain",
      `${sourceList}/${sourceId}/${sourceIndex}`
    );

    e.dataTransfer.effectAllowed = "copyMove";
    if (e.altKey || e.metaKey) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "move";
    }

    const event = new CustomEvent("dragstart", {
      bubbles: true,
      composed: true,
      detail: {
        draggedId: this._dragsourceid,
        draggedList: this.getAttribute("id"),
      },
    });

    this.dispatchEvent(event);

    this._showremove = true;
  }

  _dragOver(e: Event) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    if (e.shiftKey || e.altKey || e.ctrlKey) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "move";
    }

    this._findHighlightLocation(e.clientX, e.clientY);

    this._showhighlight = true;
    this._updateHighlightLocation();

    return false;
  }

  _dragOver2(e: Event) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    if (e.shiftKey || e.altKey || e.ctrlKey) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "move";
    }

    this._highlightLocation = 0;

    this._showhighlight = true;
    this._updateHighlightLocation();

    return false;
  }

  _dragEnd(e: Event) {
    console.log("dra gse nd", e);

    this._listelement.querySelectorAll("li").forEach((el) => {
      el.classList.remove("dragover");
      el.classList.remove("dragging");
    });

    const event = new CustomEvent("dragend", {
      bubbles: true,
      composed: true,
      detail: {},
    });
    this.dispatchEvent(event);

    this._highlightLocation = -1;

    this._updateHighlightLocation();

    this._showremove = false;

    return false;
  }

  _dragEnter(e: Event) {}

  _dragLeave(e: Event) {}

  _dragEnter2(e: Event) {
    this._showhighlight = true;
    this._updateHighlightLocation();
  }

  _dragLeave2(e: Event) {
    this._showhighlight = false;
    this._updateHighlightLocation();
  }

  _mouseOver(e: Event) {
    console.log("mouse over", e);
    this._showhighlight = true;
    this._updateHighlightLocation();
  }

  _mouseOut(e: Event) {
    console.log("mouse out", e);
    this._showhighlight = false;
    this._updateHighlightLocation();
  }

  _drop(e: Event) {
    const data = e.dataTransfer.getData("text/plain");
    const [sourceList, sourceId, sourceIndex] = data.split("/");
    const targetId = this.getAttribute("id");

    console.log("");
    console.log("drop event", e);
    console.log("source list", sourceList);
    console.log("source index ", ~~sourceIndex);
    console.log("source id", sourceId);
    console.log("destination list", targetId);
    console.log("destination location", this._highlightLocation);
    console.log("");

    let dropAfter = undefined;
    if (
      this._highlightLocation >= 1 &&
      this._highlightLocation <= this._list.length
    )
      dropAfter = this._list[this._highlightLocation - 1].id;

    let dropBefore = undefined;
    if (
      this._highlightLocation >= 0 &&
      this._highlightLocation < this._list.length
    )
      dropBefore = this._list[this._highlightLocation].id;

    let copying = e.dataTransfer.effectAllowed === "copy";

    const event3 = new CustomEvent("drop", {
      bubbles: true,
      composed: true,
      detail: {
        draggedId: sourceId,
        draggedFromList: sourceList,
        draggedFromIndex: ~~sourceIndex,
        dropInList: this.getAttribute("id"),
        dropAsIndex: this._highlightLocation,
        dropAfter,
        dropBefore,
        copying,
      } as ListDropEventDetails,
    });
    this.dispatchEvent(event3);

    if (e.preventDefault) {
      e.preventDefault();
    }

    this._dragsourceid = "";

    this._showhighlight = false;
    this._updateHighlightLocation();

    return false;
  }

  _drop2(e: Event) {
    const data = e.dataTransfer.getData("text/plain");
    const [sourceList, sourceId, sourceIndex] = data.split("/");
    const targetId = this.getAttribute("id");

    console.log("");
    console.log("drop event", e);
    console.log("source list", sourceList);
    console.log("source index ", ~~sourceIndex);
    console.log("source id", sourceId);
    console.log("destination list", targetId);
    console.log("destination location", this._highlightLocation);
    console.log("");

    let dropAfter = undefined;
    let dropBefore = undefined;

    let copying = e.dataTransfer.effectAllowed === "copy";

    const event3 = new CustomEvent("drop", {
      bubbles: true,
      composed: true,
      detail: {
        draggedId: sourceId,
        draggedFromList: sourceList,
        draggedFromIndex: ~~sourceIndex,
        dropInList: this.getAttribute("id"),
        dropAsIndex: this._highlightLocation,
        dropAfter,
        dropBefore,
        copying,
      } as ListDropEventDetails,
    });
    this.dispatchEvent(event3);

    if (e.preventDefault) {
      e.preventDefault();
    }

    this._dragsourceid = "";

    this._showhighlight = false;
    this._updateHighlightLocation();

    return false;
  }

  _removeItem(e: Event) {
    console.log("remove item, event", e);
    const button: HTMLElement = e.target;
    const li: HTMLElement = button.parentNode;
    console.log("button", button);
    console.log("li", li, li.dataset);

    const event3 = new CustomEvent("remove", {
      bubbles: true,
      composed: true,
      detail: {
        list: this.getAttribute("id"),
        id: li.dataset.id,
      },
    });
    this.dispatchEvent(event3);
  }

  enableDrop(enabled: boolean) {
    this._dropenabled = enabled;
    this.requestUpdate();
  }

  render() {
    return html`
      <div>
        <ul @dragenter=${this._dragEnter2} @dragleave=${this._dragLeave2}>
          ${this._list.map(
            (item) =>
              html`<li
                class="item dropzone"
                data-id=${item.id}
                @dragstart=${this._dragStart}
                @dragover=${this._dragOver}
                @dragenter=${this._dragEnter}
                @dragleave=${this._dragLeave}
                @dragend=${this._dragEnd}
                @drop=${this._drop}
                id=${item.id}
                draggable="true"
              >
                <span class="label">
                  ${item.label}
                  <!-- <small>(${item.id})</small> -->
                </span>

                <button class="remove" @click=${this._removeItem}>
                  &#x2715;
                </button>
              </li>`
          )}
          ${this._list.length === 0
            ? html` <li
                class="item empty"
                @dragstart=${this._dragStart}
                @dragover=${this._dragOver}
                @dragenter=${this._dragEnter}
                @dragleave=${this._dragLeave}
                @dragend=${this._dragEnd}
                @drop=${this._drop}
              >
                <span>
                  ${this.emptytext ? this.emptytext : "No passes available"}
                </span>
              </li>`
            : null}
          <li class="highlight" style="display:none;"></li>
        </ul>
        <span class="help"> Hold Alt/Option while dragging to copy </span>
      </div>
    `;
  }
}
