<template>
  <div class="wrapper">

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
            <tr><th>Column</th><th>Column</th><th>Column</th><th>Column</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
            <tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="details"/>

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
          background-color: rgba($blue, 0.1);
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
      }

      td, th{
        padding: 1em;
        text-align: right;

        &:first-child{
          text-align: left;
        }
      }

      th{
        position: sticky;
        top: 0;
        background-color: #f8f8f8;
      }
    }
  }

  .details{
    background-color: cyan;
    transition: flex-grow 0.4s ease-in-out;
    flex-grow: 0;
  }
</style>
