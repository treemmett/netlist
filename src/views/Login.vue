<template>
  <div class="card">
    <div class="brand">Netlist</div>
    <form v-on:submit.prevent="handleLogin">
      <fieldset>
        <input class="input" placeholder="Username" type="text" name="username"/>
        <input class="input" placeholder="Password" type="password" name="password"/>
        <input class="btn" type="submit" value="Login"/>
      </fieldset>
    </form>
  </div>
</template>

<script>
import api from '../api';

export default {
  methods: {
    handleLogin(e){
      // Compile data to post
      const data = {
        username: e.target.elements.username.value,
        password: e.target.elements.password.value,
      }

      api.post('/auth', data)
        .then(res => {
          // Save token to storage
          localStorage.setItem('authorization', res.data.authorization);
          alert('Login successful');
        }).catch(err => {
          try{
            if(err.response.data.error){
              alert(err.response.data.error);
            }else{
              throw new Error();
            }
          }catch(e){
            alert('Something went wrong.');
          }
          console.error(err.response);
        });
    }
  }
}
</script>


<style scoped>
  .card{
    width: 100%;
    max-width: 25em;
    border-radius: 1em;
    box-shadow: 0 5px 20px 4px rgba(#000, 0.1);
    margin: 5em auto 0 auto;
    padding: 2em 3em;
    box-sizing: border-box;
  }

  .brand{
    text-align: center;
    margin-bottom: 0.5em;
    font-size: 18px;
  }

  fieldset{
    display: flex;
  }

  .input{
    display: block;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    padding: 0;
    margin: 0.5em auto;
    outline: none;
    font-size: 14px;
    padding: 0.5em 0.75em;
    border: 1px solid #bbb;
    height: 2.5em;
    border-radius: 5px;
    transition: box-shadow 0.1s ease-in-out, border-color 0.1s ease-in-out;
  }

  .input:focus{
    border-color: #71c0f5;
    box-shadow: 0 0 1px #71c0f5;
  }

  .btn{
    margin-left: auto;
    position: relative;
    height: 35px;
  }
</style>
