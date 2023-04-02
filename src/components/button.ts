import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("klutil-button")
class ButtonElement extends LitElement {
  static styles = css`
    button {
      display: block;
      background-color: #fc0;
      border: 0;
      width: 100%;
      border-radius: 6px;
      padding: 8px 16px;
      cursor: pointer;
      text-transform: uppercase;
      font-family: "Roboto Condensed", sans-serif;
      font-weight: 700;
      margin: 0 0 5px 0;
    }

    button.secondary {
      border: 1px solid #fc0;
      background-color: #000;
      color: #fc0;
    }

    button:hover {
      opacity: 0.75;
    }
  `;

  constructor() {
    super();
    this.label = "";
    this.secondary = false;
  }

  @property({ type: Boolean })
  secondary: boolean;

  @property({ type: String })
  label: string;

  // _click(e: Event) {
  //   console.log("button click", e);
  //   if (e.preventDefault) {
  //     e.preventDefault();
  //   }

  //   const event2 = new CustomEvent("click", {
  //     bubbles: true,
  //     composed: true,
  //     detail: {},
  //   });
  //   this.dispatchEvent(event2);

  //   return false;
  // }

  render() {
    return html`<button class=${this.secondary ? "secondary" : ""}>
      ${this.label}
    </button>`;
  }
}
