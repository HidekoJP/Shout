import React, { Component } from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Chat, Friends} from '../../collections'
import {moment} from 'meteor/rzymek:moment'
import AccountsUIWrapper from '../AccountsUIWrapper'

this.Friends = Friends
this.Chat = Chat

Notification.requestPermission()

class Chatline extends TrackerReact(Component) {
  user() {
    let me = Friends.find(Meteor.user()._id).fetch()
    if (me.length ===1) 
      return me[0]
    return null
  }
  
  location() {
    return latLng(this.props.data)
  }

  componentWillMount() {
    if (this.props.data.text.indexOf('@'+this.user().name) > -1) {
      let a = new Notification(this.props.data.name, {
        body: this.props.data.text
      })
    }
  }
  render() {
    let created = moment(this.props.data.ts)
    let distance = distanceBetween(
      latLng(this.user()), 
      this.location()
    )
    return(
      <div className='chatline'>  
        <span className='time'> {created.format('HH:MM.SS')} </span>
        <span className='name'> &lt;{this.props.data.name}&gt;</span>
        <span className='text'> {this.props.data.text} </span>
      </div>
    )
  }
}

export default class _Chat extends TrackerReact(Component) {
  chat() {
    return Chat.find({}).fetch()
  }

  send(data) {
    if (data.target.value === "") return
    Meteor.call('say', {
      text: data.target.value,
      location: Geolocation.latLng(),
    })
    data.target.value = ""
    this.scrollDown()
  }

  scrollDown() {
    this.chat_end.scrollIntoView({ behavior: "smooth" })
    $('.chat_container')[0].scrollTop+=50
  }

  keypress(event) {
    if (event.key === 'Enter')
      this.send(event)
  }

  user() {
    let me = Friends.find(Meteor.user()._id).fetch()
    if (me.length ===1) 
      return me[0]
    return null
  }

  render() {
    let user = null
    if (this.user())
      user = this.user().location.coordinates.map((c) => {return c.toFixed(2)}).join(', ')
    let chat_lines = this.chat().map((line, i) => {
      return <Chatline key={i} data={line} />
    })
    return ( <div className='main_container'>
			<div className="account_ui_container">
				<AccountsUIWrapper /> 
          <span>&nbsp; &nbsp; {user} </span>
			</div>
      <div className='chat_container'> 
        {chat_lines}
        <div className='chat_end' ref={(el) => {this.chat_end = el}}> </div>
      </div>
      <div className='input_container'>
        <input onKeyPress={this.keypress.bind(this)} onBlur={this.send.bind(this)} type='text' />
      </div>
    </div>
    )
  }
}
