import React, { Component } from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Friends} from '../../collections'

class Friend extends Component {
	user_location() {
    let me = Friends.find(Meteor.user()._id).fetch()
    if (me.length ===1) 
      return latLng(me[0])
    return null
	}
  
  location() {
    return latLng(this.props.data)
  }

  remove_friend(friend_id) {
    Meteor.call('remove friend', this.props.data._id)
  }

  add_friend(friend_id) {
    Meteor.call('add friend', this.props.data._id)
  }

  removeFriend() {
    return (
      <div onClick={this.remove_friend.bind(this)} className='addOrRemove'>
        -
      </div>
    )
  }
  addFriend() {
    return (
      <div onClick={this.add_friend.bind(this)} className='addOrRemove'>
        +
      </div>
    )
  }

  render() {
    let online_marker = null
    let date = moment(this.props.data.ts)
    let now = moment()
    now.subtract(5, 'minutes')
    if (this.props.his_friend(this.props.data) && date > now) 
      online_marker = <div className="marker">*</div>
    let op = (this.props.my_friend(this.props.data)) ? this.removeFriend() : this.addFriend()
    let distance = distanceBetween(
      this.user_location(), 
      this.location()
    )
    return (
      <div className='friend animated fadeIn'> 
        {online_marker}
        <div className='name'> 
          {this.props.data.name} 
        </div>
        <div className='addOrRemove'> {op} </div>
        <div className='distance'> {distance.toFixed(2)}M </div>
      </div>
    )
  }
}

Tracker.autorun(() => {
  let location = Geolocation.currentLocation()
  if (location) {
    Meteor.subscribe('friends', Geolocation.latLng())
    Meteor.subscribe('chat', Geolocation.latLng())
  } else {
    Meteor.subscribe('friends')
    Meteor.subscribe('chat')
  }
})

export default class FriendsList extends TrackerReact(Component) {
  constructor() {
    super()
  }

  his_friend(friend) {
    return (this._user.friends.indexOf(friend._id) > -1)
  }

  my_friend(friend) {
    return (friend.friends.indexOf(this._user._id) > -1)
  }

  friends() {
    const friends = Friends.find().fetch()
    if (this.state.show != 'all')
      return friends.filter(this.my_friend.bind(this))
    return friends
  }

  selectFriends() {
    this.setState({show: 'friends'})
  }

  location() {
    return latLng(this.props.data)
  }

  selectAll() {
    this.setState({show: 'all'})
  }

  componentWillMount() {
    if (!this.state)
      return this.selectAll()
  }

  render() {
    this._user = Friends.find(Meteor.user()._id).fetch()[0]
    let left_tab_class = 'select left'
    let right_tab_class = 'select right'
    let mode = 'just_friends'
    if (this.state.show === 'all') {
      right_tab_class += ' selected'
      mode = 'all' 
    } else {
      left_tab_class += ' selected'
    }
    let friends = this.friends()
    .filter((friend) => {
      return (friend._id != Meteor.user()._id)
    })
    .map((friend) => {
      return (
        <Friend 
          key={friend.name} 
          data={friend} 
          my_friend={this.my_friend.bind(this)} 
          his_friend={this.his_friend.bind(this)} 
        />)
    })
    return (
      <div className='friends_container'>
        <div className='tab'>
          <div className={left_tab_class} onClick={this.selectFriends.bind(this)}> Friends </div>
          <div className={right_tab_class} onClick={this.selectAll.bind(this)}> All </div>
        </div>
        <div className={'friends '+mode}>
          {friends} 
        </div>
      </div>
    )
  }
}

