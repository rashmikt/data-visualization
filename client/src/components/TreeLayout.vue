<template>
  <div>
    <!-- Sidebar for node details -->
    <div v-if="selectedNode" :node="selectedNode" class="sidebar">
      <h3>{{ selectedNode.data.name }}</h3>
      <p>{{ selectedNode.data.description }}</p>
      <button @click="deselectNode"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <!-- Tree layout container -->
    <svg :width="width" :height="height" class="svg-container">
      <g :transform="`translate(${margin.right},${margin.top})`" id="tree"></g>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as d3 from "d3";
import axios from 'axios';

interface NodeData {
  name: string;
  description: string;
  parent: string;
  selected?: boolean;
}

export default defineComponent({
  name: 'HelloWorld',
  data() {
    return {
      graphData: [] as NodeData[],
      width: 600,
      height: 500,
      margin: { top: 30, right: 50, bottom: 30, left: 150 },
      selectedNode: null as d3.HierarchyNode<NodeData> | null,
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      axios.get<NodeData[]>('http://localhost:3000/api/graph')
        .then(response => {
          this.graphData = response.data;
          this.renderGraph();
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    },

    // Function to render the graph using D3.js
    renderGraph() {
      const treeLayout = d3.tree<NodeData>()
        .size([this.height - this.margin.top - this.margin.bottom, this.width - this.margin.left - this.margin.right]);

      const svg = d3.select("#tree")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr("transform", `translate(${this.margin.right},${this.margin.top})`);

      const root: d3.HierarchyNode<NodeData> = d3.stratify<NodeData>()
        .id(d => d.name)
        .parentId(d => d.parent)(this.graphData);

      treeLayout(root);

      svg.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d => {

          const sourceX = d.source.x ?? 0;
          const sourceY = d.source.y ?? 0;
          const targetX = d.target.x ?? 0;
          const targetY = d.target.y ?? 0;
          const elbowY = sourceY + (targetY - sourceY) / 2;
          return `M${sourceY},${sourceX}H${elbowY}V${targetX}H${targetY}`;
        });

      const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .on("click", (event, d) => {
          this.selectNode(d);
        });

      node.append("rect")
        .attr("width", 100)
        .attr("height", 60)
        .attr("x", -50)
        .attr("y", -30);


      node.append("text")
        .attr("dy", "0.31em")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(d => d.data.name);
    },

    selectNode(node: d3.HierarchyNode<NodeData>) {
      if (this.selectedNode || !node || !node.data || !node.data.name) {
          return;
      }
        this.selectedNode = node;
        this.selectedNode.data.selected = true;
        this.updateNodeStyles();

        axios.post("http://localhost:3000/api/select-node", {
          nodeName: node.data.name,
        }).then(response => {
          console.log("Node details retrieved:", response.data);
        }).catch(error => {
          console.error("Error selecting node:", error);
        });
    },
    
    updateNodeStyles() {
      d3.selectAll<SVGRectElement, d3.HierarchyNode<NodeData>>(".node rect")
        .style("stroke", (d) => d.data.selected ? "steelblue" : "gray")
        .style("stroke-width", (d) => d.data.selected ? 2 : 1);
    },

    deselectNode() {
      if (this.selectedNode) {
        axios.post('http://localhost:3000/api/deselect-node', { nodeName: this.selectedNode.data.name })
          .then(() => {
            if (this.selectedNode?.data) {
              this.selectedNode.data.selected = false;
              this.updateNodeStyles();
              this.selectedNode = null;
            }
          })
          .catch(error => {
            console.error("Error deselecting node:", error);
          });
      }
    }
  }

});
</script>


<style lang="scss">
.svg-container {
  transform: translateX(200px);
  padding: 20px;
}

.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  background-color: #f0f0f0;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

button {
  position: relative;
  float: right;
  top: -111px;
  right: -35px;
  background-color: rgb(23, 96, 23);
  border: none;
  padding: 5px 8px;
  color: white;
}

h3,
p {
  color: rgb(23, 96, 23);
}

.node rect {
  fill: #fff;
  stroke: rgb(156, 158, 160);
  stroke-width: 1.5px;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 1.5px;
}

.node.selected rect,
button {
  cursor: pointer;
}
</style>
