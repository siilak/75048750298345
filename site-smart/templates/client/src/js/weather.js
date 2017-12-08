console.clear();
new Vue({
  el: '.container-fluid',

  data: {
    location: "",
    temperature: "",
    degree: "C",
    weather: "",
    iconURL: ""
  },

  created: function(){
    this.getWeather();
  },

  methods: {
    getWeather: function(){
      var that = this;

      this.$http.get('http://ipinfo.io', {'headers': {
        'Origin': 'http://yourdomain.com'}
      }).then(function(response) {
        that.location = response.data.city + ", " + response.data.country;

        // Get weather informaiton
        var api = 'ebd4d312f85a230d5dc1db91e20c2ace';
        var city = response.data.city;
        var url = "http://api.openweathermap.org/data/2.5/weather?q={CITY}&APPID={APIKEY}&units=metric&nocache=" + Date.now();
        url = url.replace("{CITY}",city);
        url = url.replace("{APIKEY}", api);

        console.log(url);

        that.$http.post(url,{dataType: 'jsonp'},{
          headers : {
            'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
          }}).then(function(response) {
          console.log(response.data);
          that.temperature = response.data.main.temp;
          that.weather = response.data.weather[0]['description'];
          that.iconURL = "http://openweathermap.org/img/w/" + response.data.weather[0]['icon'] + ".png";
        }).then(function(){
          // error callback
        });

      }).then(function(){
        // console.log(response.data);
      });
    },

    changeDegree: function() {
      if(this.degree == "C"){
        this.degree = "F";
        this.temperature = Math.round((this.temperature*9/5 + 32)*100)/100;
      }else {
        this.degree = "C";
        this.temperature = Math.round(((this.temperature - 32)*5 /9)* 100)/100;
      }
    }
  }
})