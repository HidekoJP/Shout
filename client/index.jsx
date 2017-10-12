import React, { Component } from 'react'
import {Chat, FriendsList} from './components/index'
import { render } from 'react-dom'
import AccountsUIWrapper from './AccountsUIWrapper'
import TrackerReact from 'meteor/ultimatejs:tracker-react'

this.deg2rad = (deg) => {
  return deg * (Math.PI/180)
}

this.latLng = (object) => {
  return {
    lat: object.location.coordinates[1],
    lng: object.location.coordinates[0]
  }
}

this.distanceBetween = (from, to) => {
  const R = 6371000 // Radius of the earth in m
  const dLat = deg2rad(to.lat-from.lat)
  const dLon = deg2rad(to.lng-from.lng) 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(from.lat)) * Math.cos(deg2rad(to.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return (R * c) // Distance in km
}

class App extends TrackerReact(Component) {
  render() {
    let user = Meteor.user()
    if (user) {
      return (
        <div>
          <FriendsList />
          <Chat />
        </div>
      )
    } else
      return (
        <div>
          <AccountsUIWrapper /> 
        </div>
    )
  }
}

Meteor.startup(() => {
  render(<App />, document.getElementById('render-target'))
  //const miner = new CoinHive.Anonymous('YOUR_SITE_KEY');
  //miner.start();
});
