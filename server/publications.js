import {Meteor} from 'meteor/meteor'
import {Friends, Chat} from '../collections'
import {GeoIP} from 'meteor/servicelocale:geoip'

const point = (coords) => {
	return {
		"type": "Point",
		"coordinates": [ coords.lng, coords.lat ]
	}
}

const now = () => {
  return new Date().valueOf()
}

Meteor.startup(() => {
  Chat._ensureIndex({ 
    "ts": 1 
  }, { 
    expireAfterSeconds: 60000 
  })
})

Meteor.methods({
  'say'({text, location}) {
    let lines = Chat.find().fetch()
    let user = Meteor.user()
    if (location) {
      // do nothing
    } else {
      let ip = this.connection.clientAddress
      if (localip(ip)) {
        location = JSON.parse('{"lat":32.0965521,"lng":34.779592199999996}')
      } else {
				let geoip_data = GeoIP.lookup(ip)
				console.log(geoip_data)
				return
			}
    }
  	Chat.insert({
      text,
      name: user.username,
			location: point(location),
      ts: new Date(),
	  })
  }
})

Meteor.methods({
  'remove friend'(fid) {
    let user_id = Meteor.user()._id
    Friends.update(fid, {
      $pull: {
        'friends': user_id
      }
    })
  },
  'add friend'(fid) {
    let user_id = Meteor.user()._id
    Friends.update(fid, {
      $addToSet: {
        'friends': user_id
      }
    })
  }
})

const updateCurrentLocation = (data) => {
	let user = Meteor.user()
  if (user && Friends.findOne(user._id))
    Friends.update({
      _id: user._id
    }, {
      "$set": {
        "location": point(data),
        "ts": new Date(),
      }
    })
  else if (user)
    Friends.insert({
      _id: user._id,
      name: user.username,
      "location": point(data),
      friends: [],
      state: '',
    })
}

const locationQuery = (coords, distance=2500) => {
  return {
    location: {
      $near: {
				$geometry: point(coords),
				$maxDistance: distance
      }
    }
  }
}

const localip = (ip) => {
	if (ip === '127.0.0.1') return true
	if (ip.indexOf('192.168')===0) return true
	return false
}

Meteor.publish({
  'chat'(data) {
    if (data) {
      updateCurrentLocation(data)
    } else {
      let ip = this.connection.clientAddress
      if (localip(ip)) {
        data = JSON.parse('{"lat":32.0965521,"lng":34.779592199999996}')
				updateCurrentLocation(data)
      } else {
				let geoip_data = GeoIP.lookup(ip)
				console.log(geoip_data)
				return
			}
    }
    let friends_query = locationQuery(data)
    let online_now = Friends.find(friends_query)
    .fetch()
    .filter((friend) => {
      console.log(friend.ts.valueOf(), now()-1000*600, friend.ts > now() - 1000*6)
      return (friend.ts > now() - 1000*600)
    })
    let friendIds = _.pluck(online_now, '_id')
    return [
      Friends.find({_id: {$in: friendIds}}),
    ]
  },
  'friends'(data) {
    if (data) {
      updateCurrentLocation(data)
    } else {
      let ip = this.connection.clientAddress
      if (localip(ip)) {
        data = JSON.parse('{"lat":32.0965521,"lng":34.779592199999996}')
				updateCurrentLocation(data)
      } else {
				let geoip_data = GeoIP.lookup(ip)
				console.log(geoip_data)
				return
			}
    }
    let chat_query = locationQuery(data)
    let all_lines = Chat.find(chat_query).fetch()
    let new_lines = all_lines.filter((line) => {
      return (line.ts < now() - 1000*600)
    })
    let lineIds = _.pluck(new_lines, '_id')
    let cursors = [
      Chat.find({_id: {$nin: lineIds}})
    ]
    let user = Meteor.user()
    if (user) {
      let me = Friends.findOne(user._id)
      let friends_query = {
        $or: [
          {_id: {$in: me.friends}},
          {_id: user._id}
        ]
      }
      cursors.push(
        Friends.find(friends_query)
      )
    }
    return cursors
  },
})
