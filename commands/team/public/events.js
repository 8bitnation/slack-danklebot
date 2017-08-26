// setup the axios default

axios.defaults.baseURL = document.location.href;
axios.defaults.headers.common['Authorization'] = (function() {
  // get the session cookie
  // should already be URL safe
  var c = document.cookie.match(/8bn-team=([^;]+)/);
  if(c && c.length > 1) return c[1];
})();
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';



Vue.component('participant-item', {
  props: ['participant', 'event'],
  template: '#participant-item-template',
  methods: {
 		getUserName: function() {
    	return this.$root.$data.users[this.participant];
    },
    canLeave: function() {
    	return(this.participant === this.$root.$data.token.user);
    },
    leave: function() {
      console.log("leaving: "+event.id);
      this.$root.$data.inProgress = true;
      //this.event.participants.push(this.$root.$data.token.user);
      axios.get('events/'+this.event.id+'/leave').then((res) => {
        console.log(res);
        this.$root.updateData();
        //this.$root.$data.inProgress = false;
      }).catch((err) => {
        this.$root.$data.error.message = 'failed to leave event: '+err;
        this.$root.$data.error.stack = err.stack;
        this.$root.$data.inProgress = false;
      });
    }
  }
});

Vue.component('event-item', {
	props: ['event'],
  template: '#event-item-template',
  computed: {
    date: function() {
      console.log('computing date: '+this.event.timestamp);
      return new Date(parseInt(this.event.timestamp,10)).toLocaleString();
    }
  },
  methods: {
  	toggleVisible: function() {
    	this.event.visible = !this.event.visible;
    },
    canJoin: function() {
      var joined = this.event.participants.includes(this.$root.$data.token.user) ||
        	this.event.alternates.includes(this.$root.$data.token.user);
      //console.log('joined: '+joined);
    	return !joined;  
    },
    join: function(type) {
      //
      console.log('join as '+type);
      this.$root.$data.inProgress = true;
      //this.event.participants.push(this.$root.$data.token.user);
      axios.post('events/'+this.event.id+'/join', { type: type}).then((res) => {
        console.log(res);
        this.$root.updateData();
        //this.$root.$data.inProgress = false;
      }).catch((err) => {
        this.$root.$data.error.message = 'failed to join event: '+err;
        this.$root.$data.error.stack = err.stack;
        this.$root.$data.inProgress = false;
      });
    },
    leaveAsParticipant: function() {
      //
      console.log('leaveAsParticipant');
      this.$root.$data.inProgress = true;
      //this.event.participants.push(this.$root.$data.token.user);
      axios.post('events/'+this.event.id+'/leave', { type: 'participant'}).then((res) => {
        console.log(res);
        this.$root.updateData();
        //this.$root.$data.inProgress = false;
      }).catch((err) => {
        this.$root.$data.error.message = 'failed to leave event: '+err;
        this.$root.$data.error.stack = err.stack;
        this.$root.$data.inProgress = false;
      });
    },
    joinAsAlternate: function() {
      //
    	this.event.alternates.push(this.$root.$data.token.user);
    },
    
  }
});

Vue.component('channel-item', {
  props: ['channel'],
  template: '#channel-item-template',
  data: function() {
    // get dates from today for the next 14 days
    var dates = [];
    var day = new Date();
    for(var i = 0; i<14; i++) {
      dates.push({
        text: day.toDateString(),
        value: day.getFullYear() + 
          "-" + ("0" + day.getMonth()).slice (-2) + 
          "-" + ("0" + day.getDate()).slice (-2)
      });
      day.setDate(day.getDate() + 1);
    }

    return {
      newEvent: false,
      event: {
        name: '',
        date: dates[0].value,
        hour: day.getHours(),
        // closest 15 mins
        minutes: (parseInt(day.getMinutes()/15) * 15) % 60,
        ampm: 'AM'
      },
      dates: dates,
      hours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      minutes: [
        { text: '00', value: 0 }, 
        { text: '15', value: 15 },
        { text: '30', value: 30 },
        { text: '45', value: 45 } ],
      ampms: [ 'AM', 'PM' ]
    }
  },
  computed: {
    // we keep events computed so that it automatically updates
    // when $root.$data.events is updated
    events: function() {
      // get a list of events
      console.log(this.channel);
      var data = [];
      var events = this.$root.$data.events;
      for(var i=0; i < events.length; i++) {
        if(events[i].channel === this.channel.id)
          data.push(events[i]);
      }
      return data;
    }

  },
  methods: {
  	toggleVisible: function() {
    	this.channel.visible = !this.channel.visible;
    }
  }
});

var app = new Vue({
  el: '#app',
  computed: {
  },
  data: {
    inProgress: false,
    error: {
      message: '',
      stack: '',
      stackVisible: false
    },
    token: {},
		users: {},
    channels: [],
    events: []

  },
  methods: {
    initData: function(data) {
      // basic initialisation of the data we get back
      // from the REST API
      // we create the visible flag so that Vue.js can
      // correctly watch it for changes
      data.channels.forEach((c) => {
        // hide all channels except for the one that 
        // the token was issued on
        c.visible = (c.id === data.token.channel);
      });
      // init the events so that they are all hidden
      data.events.forEach((e) => {
        e.visible = false;
      });
    },
    updateData: function() {
      console.log('updateData');
      this.inProgress = true;
      axios.get('events').then((res) => {
        console.log(res);
        if(res.data.status === 'ok') {
          this.initData(res.data);
          // keep the current visible state
          this.mergeVisible(this.events, res.data.events);
          this.mergeVisible(this.channels, res.data.channels);
          // finally overwrite the current data
          // need to do this for each root element
          // 
          this.token = res.data.token;
          this.users = res.data.users;
          this.channels = res.data.channels;
          this.events = res.data.events;
        }
        this.inProgress = false;
      }).catch((err) => {
        this.error.message = 'failed to get event data: '+err;
        this.error.stack = err.stack;
        this.inProgress = false;
      });
    },
    mergeVisible: function(oldData, newData) {
      // merge the current and new visible states
      newData.forEach((n) => {
        for (var i=0; i < oldData.length; i++) {
          if (oldData[i].id === n.id) {
              // found it, set the visibility
              n.visible = oldData[i].visible;
              break; // our work here is done
          }
        }
      });
    
    }
  },
  watch: {
    events: function() {
      console.log('events updated');
    }
  },
  created: function() {
    console.log('created');
    this.updateData();
  }
})