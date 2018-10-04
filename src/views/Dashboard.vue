<template>
  <div class="wrapper" v-bind:class="{open: detailsOpen}">
    <div class="nav">
      <div class="brand">Netlist</div>

      <input type="button" class="btn" value="New Server">

      <div class="links">
        <router-link :to="{name: 'dashboard'}">Servers</router-link>
        <router-link :to="{name: 'applications'}">Applications</router-link>
        <router-link :to="{name: 'users'}">Users</router-link>
      </div>
    </div>

    <div class="main">
      <div class="actions">
        <input type="search" placeholder="Search"/>
      </div>

      <div class="table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tableData" :key="item.id" v-on:click="openDetails(item)" v-bind:class="{selected: item.id === selectedItem && detailsOpen}">
              <td>{{item.name}}</td>
              <td>{{item.location}}</td>
              <td>{{item.url}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="details">
      <div class="menu">
        <!-- close button -->
        <div class="icon" v-on:click="closeDetails">
          <svg viewBox="0 0 24 24">
            <line x1="6" y1="6" x2="18" y2="18"/>
            <line x1="18" y1="6" x2="6" y2="18"/>
          </svg>
        </div>

        <div class="name">{{currentItem.name}}</div>

        <div class="right">
          <!-- edit button -->
          <div class="icon">
            <svg viewBox="0 0 24 24">
              <polygon points="16 3 21 8 8 21 3 21 3 16 16 3"/>
            </svg>
          </div>
          
          <!-- delete button -->
          <div class="icon">
            <svg viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="section" v-for="section in currentItem.sections" v-bind:key="section.id" v-bind:class="{open: collapsedSections.indexOf(section.id) === -1}">
        <div class="title" v-on:click="toggleDetail(section.id)">{{section.name}}</div>
        <div class="expanded">
          <div class="property" v-for="item in section.keys" v-bind:key="item.id">
            <span class="name">{{item.name}}</span>
            <span class="value">{{item.value}}</span>
          </div>
        </div>
      </div>

      
    </div>

  </div>
</template>

<script>
export default {
  data(){
    return {
      detailsOpen: false,
      selectedItem: undefined,
      tableData: [
        {
          id: '1226221511',
          name: 'DCA21001',
          location: 'Denver',
          url: 'dca21001.corp.net',
          sections: [
            {
              id: '7019742071',
              name: 'General',
              keys: [
                {
                  id: '5001210912',
                  name: 'Location',
                  value: 'Denver'
                },
                {
                  id: '7822322590',
                  name: 'URL',
                  value: 'dca21001.corp.net'
                }
              ]
            },
            {
              id: '3923239575',
              name: 'Hardware',
              keys: [
                {
                  id: '6867152685',
                  name: 'CPU',
                  value: 'Intel i5'
                },
                {
                  id: '4159382112',
                  name: 'Storage',
                  value: '512GB'
                }
              ]
            }
          ]
        },
        {
          id: '1226221512',
          name: 'DCA21002',
          location: 'Pleasant Grove',
          url: 'dca21002.corp.net',
          sections: [
            {
              id: '7019742071',
              name: 'General',
              keys: [
                {
                  id: '5001210914',
                  name: 'Location',
                  value: 'Pleasant Grove'
                }
              ]
            },
            {
              id: '3923239575',
              name: 'Hardware',
              keys: [
                {
                  id: '6867152685',
                  name: 'CPU',
                  value: 'Intel i7'
                },
                {
                  id: '4159382112',
                  name: 'Storage',
                  value: '512GB'
                }
              ]
            },
            {
              id: '5770812171',
              name: 'Updates',
              keys: [
                {
                  id: '2638929976',
                  name: 'Last Updated By',
                  value: 'A lost soul'
                },
                {
                  id: '1428116357',
                  name: 'Last update date',
                  value: 'Oct 10'
                }
              ]
            }
          ]
        }
      ],
      collapsedSections: []
    }
  },
  methods: {
    closeDetails(){
      this.detailsOpen = false;
    },

    openDetails(e){
      this.detailsOpen = true;
      this.selectedItem = e.id;
    },

    toggleDetail(id){
      // Check if the ID is already in the array
      const index = this.collapsedSections.findIndex(i => i === id);

      // If the element exists, remove it
      if(index > -1){
        this.collapsedSections.splice(index, 1);
      }else{
        // Add the element if it doesn't
        this.collapsedSections.push(id);
      }
    }
  },
  computed: {
    currentItem(){
      // Find item that's currently selected
      return this.tableData.find(i => i.id === this.selectedItem) || {};
    }
  }
}
</script>

<style lang="scss" scoped>
  $blue: #4183f8;

  .wrapper{
    display: flex;
    height: 100vh;

    > *{
      flex: 1;
    }
  }

  .wrapper.open{
    .main{
      flex: 0;
      flex-basis: 45em;

      @media screen and (max-widtd: 1000px){
        flex-basis: 0;
      }
    }

    .details{
      flex-grow: 1;
    }
  }

  .nav{
    flex: 0 0 15em;
    text-align: center;
    padding-top: 1em;
    box-sizing: border-box;
    overflow-y: auto;

    .btn{
      font-size: 13px;
      padding: 10px 20px;
      text-transform: capitalize;
      margin: 2em auto;
    }

    .links{
      text-align: left;

      a{
        display: block;
        color: inherit;
        text-decoration: none;
        padding: 0.75em 1em;
        border-top-right-radius: 50em;
        border-bottom-right-radius: 50em;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;

        &:hover{
          background-color: rgba(#000, 0.05);
        }

        &.router-link-exact-active{
          background-color: rgba($blue, 0.2);
          color: #4183f8;
        }
      }
    }
  }

  .main{
    display: flex;
    flex-direction: column;
    padding: 1em;
    transition: flex-basis 0.4s ease-in-out, flex-grow 0.4s ease-in-out;

    .actions{
      margin-bottom: 1em;

      input[type=search]{
        appearance: none;
        padding: 5px 10px;
        font-size: 14px;
        border: 1px solid #bbb;
        border-radius: 5px;
        outline: none;
        width: 100%;
        max-width: 20em;

        &:focus{
          border-color: #71c0f5;
          box-shadow: 0 0 1px #71c0f5;
        }
      }
    }

    .table{
      border-radius: 8px;
      flex-grow: 1;
      overflow: auto;

      table{
        width: 100%;
        border-collapse: collapse;
      }

      tr{
        &:nth-child(2n){
          background-color: #f5f5f5;
        }

        &.selected{
          background-color: rgba($blue, 0.2);
          color: $blue;
        }
      }

      td, th{
        padding: 1em;
        text-align: left;
      }

      th{
        position: sticky;
        top: 0;
        background-color: #f8f8f8;
      }
    }
  }

  .details{
    transition: flex-grow 0.4s ease-in-out;
    flex-grow: 0;
    min-width: 0;
    overflow: hidden;

    .menu{
      padding: 2em 1em;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .icon{
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        transition: background-color 0.1s ease-out;
        cursor: pointer;

        &:hover{
          background-color: hsl(0, 0%, 95%);
        }

        svg{
          width: 24px;
          height: 24px;
          stroke-linejoin: round;
          stroke-linecap: round;
          stroke-width: 2;
          fill: none;
          stroke: #666;
        }
      }

      .right{
        display: flex;

        .icon{
          margin-left: 0.5em;
        }
      }
    }

    .section{
      margin: 0 2em;
      overflow: hidden;

      .title{
        display: flex;
        align-items: center;
        padding: 0.5em 0.75em;
        background-color: #eee;
        font-size: 16px;
        cursor: pointer;
      }
      
      .title::after{
        content: '';
        position: relative;
        display: inline-block;
        width: 0;
        height: 0;
        margin-left: auto;
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
        border-right: 4px solid #333;
        transition: transform 0.2s ease;
      }

      .expanded{
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
      }

      &.open .expanded{
        max-height: 10em;
        overflow: auto;
        transition: max-height 0.5s ease-in-out;
      }

      .property{
        padding: 0.25em 0.75em;
        font-size: 14px;
        display: flex;

        &:nth-child(2n){
          background-color: #f8f8f8;
        }

        .name{
          color: #444;
        }

        .value{
          margin-left: auto;
        }
      }

      &.open{
        .title{
          &::after{
            transform: rotate(-90deg);
          }
        }
      }
    }
  }
</style>
