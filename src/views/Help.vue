<template>
  <div class="help">
    <h1>Help</h1>
    <p>This is an overview of the boolean operators:</p>
    <ol>
      <li>Negation</li>
      <li>Disjunction and Conjunction</li>
      <li>Implication, Exclusive-Or and Identity</li>
    </ol>
    <hr/>
    <logic-table header="Negation (&not;)" :items="tNotItems" :fields="tNotFields"/>
    <hr/>
    <logic-table header="Disjunction and Conjunction" :items="tPrimaryItems" :fields="tPrimaryFields"/>
    <hr/>
    <logic-table header="Implication, Exclusive-Or, Identity" :items="tSecundaryItems" :fields="tSecundaryFields"/>
  </div>
</template>

<script>
import LogicTable from "../components/LogicTable";

export default {
  name: "Help",
  components: {
    "logic-table": LogicTable,
  },
  data() {
    return {
      tNotFields: [
        {
          key: "x",
          class: "text-center",
        },
        {
          key: "notx",
          label: "&not;X",
          sortable: false,
          class: "text-center",
        },
      ],
      tNotItems: [{x: 0, notx: 1}, {x: 1, notx: 0}],
      tPrimaryFields: [
        {
          key: "x",
          class: "text-center",
        },
        {
          key: "y",
          class: "text-center",
        },
        {
          key: "xory",
          label: "X&or;Y",
          sortable: false,
          class: "text-center",
        },
        {
          key: "xandy",
          label: "X&and;Y",
          sortable: false,
          class: "text-center",
        },
      ],
      tPrimaryItems: [
        {x: 0, y: 0, xory: 0, xandy: 0},
        {x: 0, y: 1, xory: 1, xandy: 0},
        {x: 1, y: 0, xory: 1, xandy: 0},
        {x: 1, y: 1, xory: 1, xandy: 1},
      ],
      tSecundaryFields: [
        {
          key: "x",
          class: "text-center",
        },
        {
          key: "y",
          class: "text-center",
        },
        {
          key: "xrarry",
          label: "X&rarr;Y",
          sortable: false,
          class: "text-center",
        },
        {
          key: "xoplusy",
          label: "X&oplus;Y",
          sortable: false,
          class: "text-center",
        },
        {
          key: "xharry",
          label: "X&harr;Y",
          sortable: false,
          class: "text-center",
        },
      ],
      tSecundaryItems: [
        {x: 0, y: 0, xrarry: 1, xoplusy: 0, xharry: 1},
        {x: 0, y: 1, xrarry: 0, xoplusy: 1, xharry: 0},
        {x: 1, y: 0, xrarry: 1, xoplusy: 1, xharry: 0},
        {x: 1, y: 1, xrarry: 1, xoplusy: 0, xharry: 1},
      ],
    };
  },
};
</script>

<style scoped>
.help {
  padding-bottom: 1rem;
}
</style>