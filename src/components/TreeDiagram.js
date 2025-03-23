import * as d3 from "d3";
import { html, css, LitElement } from "lit";
import React from "react";

export class TreeDiagram extends React.Component {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    svg {
      width: 100%;
      height: 100%;
      border: 1px solid blue; /* Add blue border around the SVG area */
    }

    .link {
      fill: none;
      stroke: #555;
      stroke-opacity: 0.4;
      stroke-width: 1.5px;
    }

    .node circle {
      fill: #999;
      stroke: steelblue;
      stroke-width: 3px;
    }

    .node text {
      font: 12px sans-serif;
    }
  `;

  static properties = {
    data: { type: Object },
  };

  constructor() {
    super();
    this.data = null;
  }

  connectedCallback() {
    super.connectedCallback();
    const jsonString = this.getAttribute("data-json");
    if (jsonString) {
      this.data = JSON.parse(jsonString);
    }
    this.renderTree();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
    console.log(
      `TreeDiagram.attributeChangedCallback: ${name} changed from ${oldValue} to ${newValue}`,
    );

    if (name === "data-json" && oldValue !== newValue) {
      this.data = JSON.parse(newValue);
      this.renderTree();
    }
  }

  updated(changedProperties) {
    console.log("TreeDiagram.updated");
    super.updated(changedProperties);
    if (changedProperties.has("data")) {
      this.renderTree();
    }
  }

  renderTree() {
    console.log("TreeDiagram: renderTree called", this.data);

    const svg = d3.select(this.shadowRoot.querySelector("#tree"));
    svg.selectAll("*").remove(); // Clear existing content
    if (!this.data) return;

    const width = this.clientWidth;
    const height = this.clientHeight;
    const horiz_padding = 40;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${horiz_padding},0)`);

    const root = d3.hierarchy(this.data);
    const treeLayout = d3.tree().size([height, width - 2 * horiz_padding]);

    treeLayout(root);

    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x),
      );

    const nodes = g
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    nodes.append("circle").attr("r", 5);

    nodes
      .append("text")
      .attr("dy", -10)
      .attr("x", (d) => (d.depth === 0 ? -5 : 5))
      .style("text-anchor", (d) => (d.depth === 0 ? "start" : "end"))
      .text((d) => d.data.name);
  }

  render() {
    return html`<svg id="tree"></svg>`;
  }
}

customElements.define("tree-diagram", TreeDiagram);
