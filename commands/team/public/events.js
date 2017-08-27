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
    leave: function() {
      console.log("leaving: "+event.id);
      this.$root.$data.inProgress = true;
      //this.event.participants.push(this.$root.$data.token.user);
      axios.get('events/'+this.event.id+'/leave').then((res) => {
        console.log(res);
        return this.$root.updateData();
      }).then( (d) => {
        this.$root.$data.inProgress = false;
      }).catch((err) => {
        this.$root.showError('failed to leave event', err);
        this.$root.$data.inProgress = false;
      });
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
    join: function(type) {
      //
      console.log('join as '+type);
      this.$root.$data.inProgress = true;
      axios.post('events/'+this.event.id+'/join', { type: type}).then((res) => {
        console.log(res);
        this.$root.updateData();
      }).then( (d) => {
        this.$root.$data.inProgress = false;
      }).catch((err) => {
        this.$root.showError('failed to join event', err);
        this.$root.$data.inProgress = false;
      });
    }
    
  }
});

Vue.component('channel-item', {
  props: ['channel'],
  template: '#channel-item-template',
  data: function() {
    var datePicker = this.$root.$data.datePicker;
    return {
      newEvent: false,
      event: {
        name: '',
        date: datePicker.dates[0].value,
        hour: datePicker.now.hour,
        channel: this.channel.id,
        minutes: datePicker.now.minutes,
        period: datePicker.now.period
      },
      dates: datePicker.dates,
      hours: datePicker.hours,
      minutes: datePicker.minutes,
      periods: [ 'AM', 'PM' ]
    }
  },
  methods: {
  	toggleVisible: function() {
    	this.channel.visible = !this.channel.visible;
    },
    create: function() {
      //
      console.log('creating new event '+ this.event);
      this.$root.$data.inProgress = true;
      //this.event.participants.push(this.$root.$data.token.user);
      axios.post('events', { event: this.event }).then((res) => {
        console.log(res);
        return this.$root.updateData();
      }).then( (d) => {
        // hide the new event
        this.newEvent = false;
        this.$root.$data.inProgress = false;
      }).catch((err) => {
        this.$root.showError('failed to create event', err);
        this.$root.$data.inProgress = false;
      });
    },
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
    channels: [],
    datePicker: {}

  },
  methods: {
    showError: function(msg, err) {
      if(err) {
        this.error.message = msg + ':' + err;
        this.error.stack = err.stack;
      } else {
        this.error.message = msg;
      }
    },
    updateData: function() {
      console.log('updateData');
      return axios.get('events').then((res) => {
        console.log(res);
        if(res.data.status === 'ok') {
          // keep the current visible state
          this.mergeVisible(this.channels, res.data.channels);
          // finally overwrite the current data
          // need to do this for each root element
          // 
          this.token = res.data.token;
          this.channels = res.data.channels;
          this.datePicker = res.data.datePicker;
          return Promise.resolve(res.data);
        } else {
          return Promise.reject(res.data.status);
        }
      });
    },
    mergeVisible: function(oldData, newData) {
      // merge the current and new visible states
      newData.forEach((n) => {
        for (var i=0; i < oldData.length; i++) {
          if (oldData[i].id === n.id) {
              // found it, set the visibility
              n.visible = oldData[i].visible;
              // now merge the events if they exist
              if(n.events) this.mergeVisible(oldData[i].events, n.events);
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

    this.inProgress = true;
    this.updateData().then( (d) => {
      this.inProgress = false;
    }).catch( (err) => {
      this.inProgress = false;
      this.showError('error', 'failed to get event data', err);
    });
  }
})