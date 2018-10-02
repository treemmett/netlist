<template>
  <div class="wrapper open">

    <div class="nav">
      <div class="brand">Netlist</div>

      <input type="button" class="btn" value="New Server">

      <div class="links">
        <router-link :to="{name: 'dashboard'}">Servers</router-link>
        <router-link :to="{name: 'applications'}">Applications</router-link>
        <router-link :to="{name: 'users'}">Users</router-link>
      </div>
    </div>

    <div class="table"/>

    <div class="main"/>

  </div>
</template>

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
    .table{
      flex: 0;
      flex-basis: 20em;

      @media screen and (max-width: 1000px){
        flex-basis: 0;
      }
    }

    .main{
      flex-grow: 1;
    }
  }

  .nav{
    flex: 0 0 15em;
    text-align: center;
    padding-top: 1em;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-y: overlay;

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
        margin-right: 0.5em;
        border-top-right-radius: 50em;
        border-bottom-right-radius: 50em;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;

        &:hover{
          background-color: rgba($blue, 0.1);
        }

        &.router-link-exact-active{
          background-color: rgba($blue, 0.2);
          color: #4183f8;
        }
      }
    }
  }

  .table{
    background-color: teal;
    transition: flex-basis 0.4s ease-in-out, flex-grow 0.4s ease-in-out;
  }

  .main{
    background-color: cyan;
    transition: flex-grow 0.4s ease-in-out;
    flex-grow: 0;
  }
</style>
