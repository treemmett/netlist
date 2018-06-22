import React, { Component } from 'react';
import './Toast.scss';

export class Toaster extends Component{
  constructor(props){
    super(props);
    this.count = 0;

    this.state = {
      toasts: []
    }
  }

  componentDidMount(){
    // Add pop method to toast handler
    toaster.add(this.pop);
  }

  pop = message => {
    if(typeof message === 'string'){
      const newToast = (<Toast index={this.count} key={this.count} message={message} remove={this.remove}/>);
      this.count++;
      this.setState({toasts: [...this.state.toasts, newToast]});
    }else if(message instanceof Array){
      const toasts = [];
      message.forEach(msg => {
        toasts.push(<Toast index={this.count} key={this.count} message={msg} remove={this.remove}/>);
        this.count++;
      });
      this.setState({toasts: [...this.state.toasts, ...toasts]});
    }
  }

  remove = i => {
    // Find and remove toast from state
    const toasts = [...this.state.toasts]
    const index = toasts.findIndex(obj => obj.key.toString() === i.toString());
    toasts.splice(index, 1);

    this.setState({toasts: toasts});
  }

  render(){
    return (
      <div className="toaster">
        {this.state.toasts}
      </div>
    );
  }
}

class Toast extends Component{
  constructor(props){
    super(props);
    this.state = {
      style: {},
      class: 'toast hide'
    }
  }

  componentDidMount(){
    // Trigger entry animation
    setTimeout(this.setState.bind(this), 0, {class: 'toast'});

    // Start timeout for automatic removal
    this.timeout = setTimeout(this.hideX, 4000);
  }

  hideX = () => {
    // Cancel timeout in case it was manually triggered
    clearTimeout(this.timeout);

    // Stop if toast is already deleted
    if(!this.toast){
      return;
    }

    const style = {
      marginRight: -this.toast.offsetWidth+'px',
      transition: 'margin-right 0.2s ease-in-out, margin-top 0.2s ease-in-out'
    }

    // Add listener to start vertical hide
    this.toast.addEventListener('transitionend', e => {
      if(e.propertyName === 'margin-right'){
        this.hideY();
      }
    });

    this.setState({style: style});
  }

  hideY = () => {
    const height = this.toast.offsetHeight;
    const style = {...this.state.style};
    style.marginTop = -height+'px';

    // Add listener to remove toast
    this.toast.addEventListener('transitionend', e => {
      if(e.propertyName === 'margin-top'){
        this.props.remove(this.props.index);
      }
    });

    this.setState({style: style});
  }

  mouseEvent = e => {
    // Cancel timer
    clearTimeout(this.timeout);

    // Reset timer if mouse out
    if(e.type === 'mouseleave'){
      this.timeout = setTimeout(this.hideX, 2000);
    }
  }

  render(){
    return (
      <div title={this.props.message} className={this.state.class}
      style={this.state.style} ref={ref => this.toast = ref}
      onClick={this.hideX} onMouseOver={this.mouseEvent}
      onMouseLeave={this.mouseEvent}>{this.props.message}</div>
    );
  }

  componentWillUnmount(){
    clearTimeout(this.timeout);
  }
}

const toaster = {
  add: function(fn){
    // Throw if fn is not a function
    if(typeof fn !== 'function'){
      throw new Error('Parameter is not a function');
    }

    this.events.push(fn);
  },

  remove: function(fn){
    const index = this.events.indexOf(fn);

    return this.events.splice(index, 1);
  },

  toast: function(msg){
    this.events.forEach(fn => fn.call(this, msg));
  },

  events: []
}

export default function toast(msg){
  toaster.toast.call(toaster, msg);
}