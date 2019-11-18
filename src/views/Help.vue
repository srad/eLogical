<template>
  <div>
    <h1>Help</h1>
    <h3>Negation (&not;)</h3>
    <b-table striped hover :items="tNotItems" :fields="tNotFields">
      <template v-slot:head(notx)="data">
        <span v-html="data.label"></span>
      </template>
    </b-table>
    <h3>Basic operations</h3>
    <!-- <b-table striped hover :items="tPrimaryItems" :fields="tPrimaryFields" :tbody-tr-class="'text-center'"> -->
    <b-table striped hover :items="tPrimaryItems" :fields="tPrimaryFields">
      <template v-slot:head(xory)="data">
        <span v-html="data.label"></span>
      </template>
      <template v-slot:head(xandy)="data">
        <span v-html="data.label"></span>
      </template>
    </b-table>
    <h3>Secondary operations</h3>
    <b-table striped hover :items="tSecundaryItems" :fields="tSecundaryFields">
      <template v-slot:head()="data">
        <span v-html="data.label"></span>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "Help",
  data() {
    return {
      tNotFields: [
        {
          key: "x",
          class: "text-center"
        },
        {
          key: "notx",
          label: "&not;X",
          sortable: false,
          class: "text-center"
        }
      ],
      tNotItems: [{ x: 0, notx: 1 }, { x: 1, notx: 0 }],
      tPrimaryFields: [
        {
          key: "x",
          class: "text-center"
        },
        {
          key: "y",
          class: "text-center"
        },
        {
          key: "xory",
          label: "X&or;Y",
          sortable: false,
          class: "text-center"
        },
        {
          key: "xandy",
          label: "X&and;Y",
          sortable: false,
          class: "text-center"
        }
      ],
      tPrimaryItems: [
        { x: 0, y: 0, xory: 0, xandy: 0 },
        { x: 0, y: 1, xory: 1, xandy: 0 },
        { x: 1, y: 0, xory: 1, xandy: 0 },
        { x: 1, y: 1, xory: 1, xandy: 1 }
      ],
      tSecundaryFields: [
        {
          key: "x",
          class: "text-center"
        },
        {
          key: "y",
          class: "text-center"
        },
        {
          key: "xrarry",
          label: "X&rarr;Y",
          sortable: false,
          class: "text-center"
        },
        {
          key: "xoplusy",
          label: "X&oplus;Y",
          sortable: false,
          class: "text-center"
        },
        {
          key: "xharry",
          label: "X&harr;Y",
          sortable: false,
          class: "text-center"
        }
      ],
      tSecundaryItems: [
        { x: 0, y: 0, xrarry: 1, xoplusy: 0, xharry: 1 },
        { x: 0, y: 1, xrarry: 0, xoplusy: 1, xharry: 0 },
        { x: 1, y: 0, xrarry: 1, xoplusy: 1, xharry: 0 },
        { x: 1, y: 1, xrarry: 1, xoplusy: 0, xharry: 1 }
      ]
    };
  }
};
</script>

<style scoped>
</style>