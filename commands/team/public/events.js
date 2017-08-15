Vue.component('participant-item', {
  props: ['participant'],
  template: '#participant-item-template',
  methods: {
 		getUserName: function(id) {
    	return this.$root.$data.users[id];
    },
    canLeave: function(p) {
    	return(p === this.$root.$data.owner);
    }
  }
});

Vue.component('event-item', {
	props: ['event'],
  template: '#event-item-template',
  methods: {
  	toggleVisible: function() {
    	this.event.visible = !this.event.visible;
    },
    canJoin: function(e) {
      var joined = e.participants.includes(this.$root.$data.owner) ||
        	e.alternates.includes(this.$root.$data.owner);
      //console.log('joined: '+joined);
    	return !joined;  
    },
    joinAsParticipant: function(e) {
    	e.participants.push(this.$root.$data.owner);
    },
    joinAsAlternate: function(e) {
    	e.alternates.push(this.$root.$data.owner);
    }
    
  }
});

Vue.component('channel-item', {
  props: ['channel'],
  template: '#channel-item-template',
  methods: {
  	toggleVisible: function() {
    	this.channel.visible = !this.channel.visible;
    }
  }
});

var app = new Vue({
  el: '#app',
  data: {
    session: (function() {
      // get the session cookie
      var c = document.cookie.match(/8bn-team=([^;]+)/);
      if(c && c.length > 1) return c[1];
    } )(),
    owner: 'U8',
		users: {
      'UR': '* reserved *',
      'U0': 'geekydeaks',
      'U1': 'retro',
      'U2': 'zepto',
      'U3': 'tnamorf',
      'U4': 'imeyer',
      'U5': 'starbuck',
      'U6': 'jofax88',
      'U7': 'rain-8bn',
      'U8': 'unclenooby'
    },
    channels: [
      { 
        name: 'ps4-pve-raids',
        id: 'C0',
        visible: false,
        events: [
          {
            name: 'Templar Tango',
            id: 'E0',
            date: '2017-08-11 14:00',
            visible: false,
            participants: [ 'U0', 'U1', 'U2', 'U3' ],
            alternates: [ 'U4', 'U8' ]
          },
          {
            name: 'Vosik Volta',
            id: 'E1',
            date: '2017-08-13 19:00',
            visible: false,
            participants: [ 'U2', 'UR', 'UR', 'U1', 'U4', 'U7' ],
            alternates: [ 'U3' ]
          },
          {
            name: 'Oryx Odissi',
            id: 'E4',
            date: '2017-08-13 10:00',
            visible: false,
            participants: [ 'U7' ],
            alternates: [ 'U3' ]
          }
        ]
      },
      {
        name: 'ps4-pve-general',
        id: 'C1',
        visible: true,
        events: [
          {
            name: 'Sword Swinging',
            id: 'E2',
            date: '2017-08-14 13:00',
            visible: false,
            participants: [ 'U1', 'U2', 'U3' ],
            alternates: [ 'U4', 'U0' ]
          },
          {
          	name: 'Fallen Fandango',
            id: 'E5',
            date: '2017-08-19 12:00',
            visible: false,
            participants: [ 'U8', 'UR' ],
            alternates: []
          }
        ]
      },
      {
        name: 'xb1-pve-raids',
        id: 'C2',
        visible: false,
        events: [
          {
            name: 'Crota Cha Cha Cha',
            id: 'E3',
            date: '2017-08-10 14:00',
            visible: false,
            participants: [ 'U7', 'U5', 'U6' ],
            alternates: [  ]
          },
          {
            name: 'Wrath Waltz',
            id: 'E6',
            date: '2017-08-10 18:00',
            visible: false,
            participants: [ 'U7', 'UR', 'UR' ],
            alternates: [  ]
          }
        ]
      }
    ]
  }
})