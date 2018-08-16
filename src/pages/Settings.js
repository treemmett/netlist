import React, { Component } from 'react';
import { connect } from 'react-redux';
import toast from '../components/Toast';
import axios from 'axios';
import './Settings.scss';

@connect(store => {
  return {
    settings: store.settings
  }
})
export default class extends Component{
  componentDidMount(){
    document.title = 'Netlist - Settings';
  }

  render(){
    return (
      <div className="page settings">
        <form className="section" onSubmit={e => {
          e.preventDefault();

          axios({
            method: e.target.elements.dns.value.trim() ? 'patch' : 'delete',
            url: '/settings/dns/'+encodeURIComponent(e.target.elements.dns.value)
          }).then(res => {
            toast('Settings saved');
            this.props.dispatch({
              type: 'SET_SETTINGS',
              payload: res.data
            });
          }).catch(() => {});
        }}>
          <fieldset>
            <label htmlFor="dns">Default DNS Suffix</label>
            <input ref={a => this.dnsInput = a} id="dns" name="dns" placeholder="domain.tld" defaultValue={this.props.settings.dns}/>
            <div className="actions">
              <input type="submit" className="btn" value="Save"/>
            </div>
          </fieldset>
        </form>
      </div>
    );
  }
}